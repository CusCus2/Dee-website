import './styles.css';
import { renderLayout } from './components/layout.js';
import { initExternalForms } from './forms.js';

initExternalForms();
export const authReady = renderLayout();
