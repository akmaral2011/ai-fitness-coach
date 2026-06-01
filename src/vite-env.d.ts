/// <reference types="vite/client" />

/* eslint-disable @typescript-eslint/consistent-type-definitions */

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonTheme = 'outline' | 'filled_blue' | 'filled_black';
type GoogleButtonSize = 'large' | 'medium' | 'small';

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (options: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }) => void;
        renderButton: (
          element: HTMLElement,
          options: {
            theme?: GoogleButtonTheme;
            size?: GoogleButtonSize;
            type?: 'standard' | 'icon';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            width?: number;
            logo_alignment?: 'left' | 'center';
          }
        ) => void;
      };
    };
  };
}
