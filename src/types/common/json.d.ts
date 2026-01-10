type JsonPrimitiveType = string | number | boolean | null;

type JsonType = JsonPrimitiveType | JsonType[] | { [key: string]: JsonType };

type JsonComplexType = Exclude<JsonType, JsonPrimitiveType>;
