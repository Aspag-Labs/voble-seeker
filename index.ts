// Polyfills must be first — each in its own module so side effects run in import order
import 'react-native-get-random-values';
import './src/polyfills/buffer';
import { installCryptoSubtlePolyfill } from './src/polyfills/crypto-subtle';
installCryptoSubtlePolyfill();

// App entry point
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
