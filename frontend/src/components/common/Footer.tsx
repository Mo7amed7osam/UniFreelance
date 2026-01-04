import React from 'react';

const Footer: React.FC = () => (
    <footer className="border-t border-ink-100 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-center text-sm text-ink-500 md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} UniFreelance. All rights reserved.</p>
            <div className="flex gap-4">
                <a className="font-semibold text-ink-600 hover:text-ink-900" href="/terms">
                    Terms of Service
                </a>
                <a className="font-semibold text-ink-600 hover:text-ink-900" href="/privacy">
                    Privacy Policy
                </a>
            </div>
        </div>
    </footer>
);

export default Footer;
