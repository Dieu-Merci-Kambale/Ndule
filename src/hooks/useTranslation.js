import { useLocation } from 'react-router-dom';
import fr from '../locales/fr';
import en from '../locales/en';

const locales = {
  fr,
  en
};

export const useTranslation = () => {
  const location = useLocation();
  
  // Extract the language code from the path (e.g. /fr/privacy -> fr, /en -> en)
  // Default to 'fr' if no match
  const match = location.pathname.match(/^\/(fr|en)(\/|$)/);
  const lang = match ? match[1] : 'fr';

  const t = locales[lang] || locales.fr;

  return { t, lang };
};
