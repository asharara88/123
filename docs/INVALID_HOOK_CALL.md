# Debugging Invalid Hook Call in React

If you encounter `Invalid hook call` errors while running the Biowell application, it usually means that React hooks are being executed in an unsupported context. The most common reasons are:

1. **Mismatched React Versions** – `react` and `react-dom` must use the same version. Verify with `npm ls react react-dom`.
2. **Breaking the Rules of Hooks** – Hooks must only run inside React function components or other custom hooks. Ensure `useAutoScroll` is called directly inside `AIHealthCoach` and not conditionally.
3. **Multiple Copies of React** – Having more than one copy of React can cause this error. Check for duplicates with `npm ls react`.

After checking these points, restart your development server. See the [React docs](https://reactjs.org/link/invalid-hook-call) for more tips.
