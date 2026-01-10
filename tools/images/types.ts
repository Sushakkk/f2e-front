export type CashResult = {
  [key: string]: {
    preCompressedSize: string;
    compressedSize: string;
  };
};

export type Config = {
  srcPatterns: string[];
  exclude?: string[];
};

export type FileInfo = {
  hash: string;
  size: string;
};
