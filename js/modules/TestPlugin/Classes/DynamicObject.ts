/**
 * Represents a basic JavaScript object, that can take any key, and have any value.
 * This enables easy construction of dynamic objects in TypeScript, but forgoes
 * a lot of the type safety for convenience
 */
export interface DynamicObject {
    [key: string]: any
}