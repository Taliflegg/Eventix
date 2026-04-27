import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en'
    }
  })
}));

// Mock Google OAuth Provider
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  GoogleLogin: () => <div>Google Login Mock</div>
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  ToastContainer: () => <div>Toast Container Mock</div>,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

test('App component exists', () => {
  expect(App).toBeDefined();
});

test('renders without crashing', () => {
  console.log('Starting test...');
  
  const { container } = render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  console.log('App rendered successfully');
  console.log('Container HTML:', container.innerHTML);
  
  // Just check that the app renders without throwing
  const appElement = container.querySelector('.App');
  console.log('App element found:', !!appElement);
  
  expect(appElement).toBeInTheDocument();
  console.log('Test completed successfully');
});
