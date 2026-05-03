declare module "*?raw" {
  const content: string;
  export default content;
}

declare module "*?worker" {
  const ctor: { new (options?: WorkerOptions): Worker };
  export default ctor;
}

declare module "*?url" {
  const url: string;
  export default url;
}
