interface ServerUnavailableProps {
  compact?: boolean;
  onRetry?: () => void;
}

export function ServerUnavailable({ compact = false, onRetry }: ServerUnavailableProps) {
  return <section className={`server-unavailable${compact ? " compact" : ""}`} role="alert">
    <span className="eyebrow"><i /> Studio offline</span>
    <h1>The server is down right now.</h1>
    <p>This studio runs on a private server. Contact the admin to have it turned back on.</p>
    <div className="server-contacts">
      <a href="mailto:ashwin102@gmail.com"><small>Email</small><strong>ashwin102@gmail.com</strong></a>
      <a href="tel:8019328461"><small>Phone</small><strong>8019328461</strong></a>
    </div>
    {onRetry && <button className="secondary-button" type="button" onClick={onRetry}>Try the server again <span>↻</span></button>}
  </section>;
}
