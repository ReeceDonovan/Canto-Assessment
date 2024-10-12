import { Provider } from 'react-redux';

import { render, screen } from '@testing-library/react';

import App from '../App';
import store from '../store';

// Mock the ThemeToggle component
jest.mock('../components/ThemeToggle', () => {
    return {
        __esModule: true,
        default: () => null
    };
});

test('renders Book Management heading', () => {
    // Wrap the component in a Provider with the store
    render(
        <Provider store={store}>
            <App />
        </Provider>
    );
    const headingElement = screen.getByText(/Book Management/i);
    expect(headingElement).toBeInTheDocument();
})
