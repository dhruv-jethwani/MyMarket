import { registerRootComponent } from 'expo';
import App from './App';
import "nativewind/types.d.ts"; // Optional: helps VS Code

// This line tells Expo that 'App.jsx' is the main component to load
registerRootComponent(App);