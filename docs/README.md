# JSR-352 Batch Tool 🚀

> A friendly wizard to help you create Java batch jobs without the headache!

## What's This All About? 🤔

Ever had to configure a JSR-352 batch job and felt like you needed a PhD in XML? We've been there! This tool turns that painful process into a simple, step-by-step wizard that actually makes sense.

**Think of it as:** Your friendly neighborhood batch job builder 🏗️

## What Can It Do? ✨

- 🎯 **Simple wizard** - Just follow the steps, no guesswork
- 🔄 **Smart step creation** - Picks the right screens based on what you need
- ✅ **Catches mistakes** - Won't let you use the same class name twice
- 💾 **Remembers everything** - Your progress is always saved
- 📱 **Works everywhere** - Desktop, tablet, phone - we got you covered

## Quick Peek at the Structure 👀

```
src/
├── screens/     # The pages you see
├── hooks/       # Reusable React magic
├── utils/       # Helper functions
├── types/       # TypeScript definitions
└── components/  # UI building blocks
```

## Get Started in 30 Seconds ⚡

```bash
# Get the dependencies
npm install

# Fire it up!
npm run dev

# That's it! Open http://localhost:5173 🎉
```

## Need More Info? 📚

### 🎓 **Learn About JSR-352**
- 🚀 [JSR-352 Guide](./JSR352-GUIDE.md) - What's JSR-352 all about?
- 🔄 [Batch Job Flows](./BATCH-FLOWS.md) - How different job patterns work

### 🛠️ **Technical Documentation**
- 🏠 [Project Structure](./STRUCTURE.md) - How everything fits together
- 🖥️ [Screens Guide](./SCREENS.md) - What each page does
- 🎣 [Hooks Guide](./HOOKS.md) - Our custom React hooks
- 🛠️ [Utils Guide](./UTILS.md) - Handy helper functions
- 📝 [Types Guide](./TYPES.md) - TypeScript definitions
- 🚀 [Dev Guide](./DEVELOPMENT.md) - For contributors

## What's Under the Hood? 🔧

- **React** - Because it's awesome
- **TypeScript** - Catches bugs before they bite
- **Vite** - Super fast builds
- **Zustand** - Simple state management
- **Tailwind** - Pretty styles without the CSS headaches

## How Does It Work? 🔄

1. **Tell us about your job** - Name, schedule, that sort of thing
2. **Add some properties** - Configuration values your job needs
3. **Set up listeners** - If you want to know when things happen
4. **Configure your steps** - The actual work your job does
5. **Review everything** - Make sure it looks right
6. **Done!** - You've got a batch job! 🎉

## Want to Help Out? 🤝

Awesome! Check out our [Development Guide](./DEVELOPMENT.md) - it's friendlier than it sounds, promise! 😊