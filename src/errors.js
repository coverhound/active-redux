export const missingStore = () => (
  new Error(
    ```
    No store provided to model
    [link to debug]
    ```
  )
);

export const updateImmutable = () => (
  new Error(`Cannot update an immutable Model`)
);
