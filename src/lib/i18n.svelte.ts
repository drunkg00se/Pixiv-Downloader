import en from '@/locales/en.json';
import zh from '@/locales/zh-CN.json';

type MessageType<T, Message = string> = T extends string
  ? string
  : T extends Record<string, unknown>
    ? MessageDictionary<T, Message>
    : T;

type MessageDictionary<T, Message = string> = {
  [K in keyof T]: MessageType<T[K], Message>;
};

type MessageValue<Message = string> = MessageDictionary<any, Message> | string;

type Message<Message = string> = Record<string, MessageValue<Message>>;

type I18nOption<Schema extends Message, locale extends string> = {
  locale: locale;
  message: Record<locale, Schema>;
};

type JsonPaths<T, Key extends keyof T = keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ? `${Key}.${JsonPaths<T[Key]>}`
    : `${Key}`
  : never;

function createI18n<Schema extends Message, Locale extends string>(
  option: I18nOption<Schema, Locale>
) {
  let locale = $state<Locale>(option.locale);

  const setlocale = (newlocale: Locale) => {
    if (newlocale === locale || !Object.keys(option.message).includes(newlocale)) return;
    locale = newlocale;
  };

  const t = <T extends Schema>(jsonPath: JsonPaths<T>) => {
    const paths: string[] = jsonPath.split('.');

    let msg: any = option.message[locale];
    for (const path of paths) {
      msg = msg[path];
      if (msg === undefined) return 'null';
    }

    return msg as string;
  };

  return {
    t,
    setlocale,

    locale: {
      get current() {
        return locale;
      }
    },

    get availableLocales() {
      return Object.keys(option.message);
    }
  };
}

const message = {
  zh,
  en
};

export type Locale = keyof typeof message;

const browserLocale = navigator.language.split('-')[0];

export const { t, setlocale, locale, availableLocales } = createI18n<typeof zh, Locale>({
  locale: browserLocale in message ? (browserLocale as keyof typeof message) : 'en',
  message
});
