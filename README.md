# Chrome dino

Re-create Chrome Dino game using Canvas and TypeScript.

## How to use it

Specify a node as root node to contain the canvas, e.g., `#main-frame-error`. Import `Runner` class and then instantiate it with static `getInstance()` method. Remember to remove the listeners after destroyed by invoking `stopListening()` method.

```tsx
import Runner from "@/game/Runner"

export default function App() {
  useEffect(() => {
    const runner = Runner.getInstance("#main-frame-error")

    return () => {
      console.log("---Component Destroyed----")
      runner.stopListening()
    }
  }, [])

  return (<div id="main-frame-error"></>)
}
```

The game uses `requestAnimateFrame()` to boost drawing and make it move. Flag `updatePending` prevents duplicated registration of `requestAnimateFrame()`.

```ts
class Runner {
  // member properties

  update() {
    this.updatePending = false
    // Perform all the drawing tasks

    // Schedule next frame drawing
    this.scheduleNextUpdate()
  }

  scheduleNextUpdate() {
    if (!this.updatePending) {
      this.updatePending = true
      // Register callback for the next available frame time to draw the next frame
      this.raqId = requestAnimationFrame(this.update.bind(this))
    }
  }
}
```

## Remarks

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
