export interface PackageInfo {
  id: string;
  name: string;
  title: string;
  description: string;
  tags?: string[];
  parameters: Record<
    string,
    {
      type: string;
      required: boolean;
      description: string;
    }
  >;
  commandInfo: {
    command: string;
    args: string[];
  };
}

export class RegistryService {
  private readonly registryBaseUrl = 'https://registry.mcphub.io';

  async getPackageInfo(name: string): Promise<PackageInfo> {
    const registryUrl = `${this.registryBaseUrl}/registry/${name}`;
    const response = await fetch(registryUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch package info: ${response.statusText}`);
    }
    return (await response.json()) as PackageInfo;
  }

  async listPackages(): Promise<PackageInfo[]> {
    const registryUrl = `${this.registryBaseUrl}/registry`;
    const response = await fetch(registryUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch package list: ${response.statusText}`);
    }
    return (await response.json()) as PackageInfo[];
  }

  async searchPackages(query: string): Promise<PackageInfo[]> {
    const searchUrl = `${this.registryBaseUrl}/search?q=${encodeURIComponent(
      query
    )}`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Failed to search packages: ${response.statusText}`);
    }
    return (await response.json()) as PackageInfo[];
  }
}

export const registrySrv = new RegistryService();
