// Componentes React para User Analytics - InclusiveAI Coach

import * as React from 'react';
import { 
  useAnalytics, 
  trackPageView, 
  trackEvent, 
  AnalyticsEvent 
} from './user-analytics';

// Componente para tracking automático de páginas
export function AnalyticsPageTracker({ path, title }: { path: string; title?: string }) {
  const { trackPageView } = useAnalytics();

  React.useEffect(() => {
    trackPageView(path, title);
  }, [path, title, trackPageView]);

  return null;
}

// Componente para tracking de eventos de usuario
export function AnalyticsEventTracker({ 
  children, 
  event 
}: { 
  children: React.ReactNode;
  event: Omit<AnalyticsEvent, 'timestamp'>;
}) {
  const { trackEvent } = useAnalytics();

  const handleClick = React.useCallback(() => {
    trackEvent(event);
  }, [event, trackEvent]);

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
}
