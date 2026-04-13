import { CweClient, CweApiError } from './index';
import type { CweVersion, CweEntry, CweWeakness, CweCategory, CweView } from './index';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse<T>(data: T, status = 200): void {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    json: () => Promise.resolve(data),
  });
}

describe('CweClient', () => {
  let cwe: CweClient;

  beforeEach(() => {
    mockFetch.mockClear();
    cwe = new CweClient();
  });

  describe('constructor', () => {
    it('uses the default base URL', () => {
      const client = new CweClient();
      expect(client).toBeInstanceOf(CweClient);
    });

    it('accepts a custom base URL', () => {
      const client = new CweClient({ baseUrl: 'https://my-mirror.example.com/api/v1' });
      expect(client).toBeInstanceOf(CweClient);
    });

    it('strips trailing slash from baseUrl', async () => {
      const client = new CweClient({ baseUrl: 'https://cwe-api.mitre.org/api/v1/' });
      mockResponse<CweVersion>({
        ContentVersion: '4.19.1',
        ContentDate: '2026-01-21',
        TotalWeaknesses: 969,
        TotalCategories: 420,
        TotalViews: 58,
      });
      await client.version();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://cwe-api.mitre.org/api/v1/cwe/version',
        expect.any(Object),
      );
    });
  });

  describe('version()', () => {
    it('fetches version metadata', async () => {
      const versionData: CweVersion = {
        ContentVersion: '4.19.1',
        ContentDate: '2026-01-21',
        TotalWeaknesses: 969,
        TotalCategories: 420,
        TotalViews: 58,
      };
      mockResponse(versionData);
      const result = await cwe.version();
      expect(result.ContentVersion).toBe('4.19.1');
      expect(result.TotalWeaknesses).toBe(969);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://cwe-api.mitre.org/api/v1/cwe/version',
        expect.any(Object),
      );
    });
  });

  describe('lookup()', () => {
    it('fetches multiple CWE entries by ID', async () => {
      const entries: CweEntry[] = [
        { Type: 'class_weakness', ID: '74' },
        { Type: 'base_weakness', ID: '79' },
      ];
      mockResponse(entries);
      const result = await cwe.lookup([74, 79]);
      expect(result).toHaveLength(2);
      expect(result[0].ID).toBe('74');
      expect(result[1].Type).toBe('base_weakness');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://cwe-api.mitre.org/api/v1/cwe/74,79',
        expect.any(Object),
      );
    });

    it('handles a single ID lookup', async () => {
      mockResponse([{ Type: 'base_weakness', ID: '79' }]);
      await cwe.lookup([79]);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://cwe-api.mitre.org/api/v1/cwe/79',
        expect.any(Object),
      );
    });
  });

  describe('weakness()', () => {
    const weaknessData: Pick<CweWeakness, 'ID' | 'Name' | 'Abstraction' | 'Structure' | 'Status' | 'Description'> = {
      ID: '79',
      Name: "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')",
      Abstraction: 'Base',
      Structure: 'Simple',
      Status: 'Stable',
      Description: 'The product does not neutralize...',
    };

    it('returns a WeaknessResource', () => {
      const resource = cwe.weakness(79);
      expect(resource).toBeDefined();
      expect(typeof resource.get).toBe('function');
      expect(typeof resource.parents).toBe('function');
      expect(typeof resource.children).toBe('function');
      expect(typeof resource.ancestors).toBe('function');
      expect(typeof resource.descendants).toBe('function');
    });

    it('can be awaited directly', async () => {
      mockResponse({ Weaknesses: [weaknessData] });
      const result = await cwe.weakness(79);
      expect(result.ID).toBe('79');
      expect(result.Name).toContain('Cross-site Scripting');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://cwe-api.mitre.org/api/v1/cwe/weakness/79',
        expect.any(Object),
      );
    });

    it('.get() fetches full weakness', async () => {
      mockResponse({ Weaknesses: [weaknessData] });
      const result = await cwe.weakness(79).get();
      expect(result.Abstraction).toBe('Base');
    });

    it('.parents() fetches direct parents without view param', async () => {
      mockResponse([{ Type: 'pillar_weakness', ID: '707', ViewID: '1000', Primary_Parent: true }]);
      const result = await cwe.weakness(74).parents();
      expect(result).toHaveLength(1);
      expect(result[0].ID).toBe('707');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://cwe-api.mitre.org/api/v1/cwe/74/parents',
        expect.any(Object),
      );
    });

    it('.parents() appends view query param when provided', async () => {
      mockResponse([{ Type: 'pillar_weakness', ID: '707', ViewID: '1000', Primary_Parent: true }]);
      await cwe.weakness(74).parents(1000);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/cwe/74/parents');
      expect(url).toContain('view=1000');
    });

    it('.children() fetches direct children', async () => {
      mockResponse([
        { Type: 'base_weakness', ID: '79', ViewID: '1000' },
        { Type: 'class_weakness', ID: '77', ViewID: '1000' },
      ]);
      const result = await cwe.weakness(74).children(1000);
      expect(result).toHaveLength(2);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/cwe/74/children');
      expect(url).toContain('view=1000');
    });

    it('.ancestors() fetches ancestor tree', async () => {
      mockResponse([
        {
          Data: { Type: 'class_weakness', ID: '74', ViewID: '1000' },
          Parents: [
            {
              Data: { Type: 'pillar_weakness', ID: '707', ViewID: '1000' },
              Parents: null,
            },
          ],
        },
      ]);
      const result = await cwe.weakness(74).ancestors(1000);
      expect(result).toHaveLength(1);
      expect(result[0].Data.ID).toBe('74');
      expect(result[0].Parents).toHaveLength(1);
      expect(result[0].Parents![0].Data.ID).toBe('707');
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/cwe/74/ancestors');
    });

    it('.descendants() fetches descendant tree', async () => {
      mockResponse([
        {
          Data: { Type: 'class_weakness', ID: '74', ViewID: '1000' },
          Children: [
            { Data: { Type: 'base_weakness', ID: '79', ViewID: '1000' }, Children: null },
          ],
        },
      ]);
      const result = await cwe.weakness(74).descendants(1000);
      expect(result).toHaveLength(1);
      expect(result[0].Children).toHaveLength(1);
      expect(result[0].Children![0].Data.ID).toBe('79');
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/cwe/74/descendants');
    });
  });

  describe('category()', () => {
    const categoryData: Pick<CweCategory, 'ID' | 'Name' | 'Status' | 'Summary'> = {
      ID: '189',
      Name: 'Numeric Errors',
      Status: 'Draft',
      Summary: 'Weaknesses related to improper calculation or conversion of numbers.',
    };

    it('returns a CategoryResource', () => {
      const resource = cwe.category(189);
      expect(resource).toBeDefined();
      expect(typeof resource.get).toBe('function');
    });

    it('can be awaited directly', async () => {
      mockResponse({ Categories: [categoryData] });
      const result = await cwe.category(189);
      expect(result.ID).toBe('189');
      expect(result.Name).toBe('Numeric Errors');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://cwe-api.mitre.org/api/v1/cwe/category/189',
        expect.any(Object),
      );
    });

    it('.get() fetches full category', async () => {
      mockResponse({ Categories: [categoryData] });
      const result = await cwe.category(189).get();
      expect(result.Status).toBe('Draft');
    });
  });

  describe('view()', () => {
    const viewData: Pick<CweView, 'ID' | 'Name' | 'Type' | 'Status'> = {
      ID: '1425',
      Name: 'Weaknesses in the 2023 CWE Top 25 Most Dangerous Software Weaknesses',
      Type: 'Graph',
      Status: 'Draft',
    };

    it('returns a ViewResource', () => {
      const resource = cwe.view(1425);
      expect(resource).toBeDefined();
      expect(typeof resource.get).toBe('function');
    });

    it('can be awaited directly', async () => {
      mockResponse({ Views: [viewData] });
      const result = await cwe.view(1425);
      expect(result.ID).toBe('1425');
      expect(result.Type).toBe('Graph');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://cwe-api.mitre.org/api/v1/cwe/view/1425',
        expect.any(Object),
      );
    });

    it('.get() fetches full view', async () => {
      mockResponse({ Views: [viewData] });
      const result = await cwe.view(1425).get();
      expect(result.Name).toContain('CWE Top 25');
    });
  });

  describe('on() event emitter', () => {
    it('emits request events on successful requests', async () => {
      mockResponse<CweVersion>({
        ContentVersion: '4.19.1',
        ContentDate: '2026-01-21',
        TotalWeaknesses: 969,
        TotalCategories: 420,
        TotalViews: 58,
      });
      const events: unknown[] = [];
      cwe.on('request', (e) => events.push(e));
      await cwe.version();
      expect(events).toHaveLength(1);
      const event = events[0] as { url: string; method: string; statusCode: number };
      expect(event.url).toBe('https://cwe-api.mitre.org/api/v1/cwe/version');
      expect(event.method).toBe('GET');
      expect(event.statusCode).toBe(200);
    });

    it('emits request events with error on failed requests', async () => {
      mockResponse({}, 404);
      const events: unknown[] = [];
      cwe.on('request', (e) => events.push(e));
      await expect(cwe.version()).rejects.toThrow(CweApiError);
      expect(events).toHaveLength(1);
      const event = events[0] as { statusCode: number; error: Error };
      expect(event.statusCode).toBe(404);
      expect(event.error).toBeInstanceOf(CweApiError);
    });
  });

  describe('CweApiError', () => {
    it('throws CweApiError on non-2xx responses', async () => {
      mockResponse({}, 404);
      await expect(cwe.weakness(99999).get()).rejects.toThrow(CweApiError);
    });

    it('CweApiError has status and statusText', async () => {
      mockResponse({}, 404);
      try {
        await cwe.version();
      } catch (err) {
        expect(err).toBeInstanceOf(CweApiError);
        const apiErr = err as CweApiError;
        expect(apiErr.status).toBe(404);
        expect(apiErr.statusText).toBe('Not Found');
        expect(apiErr.message).toBe('CWE API error: 404 Not Found');
      }
    });
  });
});
