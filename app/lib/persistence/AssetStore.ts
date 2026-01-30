import { Asset } from '@/app/types';

export interface AssetStore {
  loadAssets(): Promise<Asset[]>;
  saveAssets(assets: Asset[]): Promise<void>;
}
