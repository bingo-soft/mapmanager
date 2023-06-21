declare module "*.svg?inline" {
  const content: any
  export default content
}

declare module "*.svg" {
  const content: any
  export default content
}

/* export {}
declare global {
    var _MAP_INSTANCE_: unknown
} */