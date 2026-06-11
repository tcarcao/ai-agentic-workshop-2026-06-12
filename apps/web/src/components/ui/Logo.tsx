import { Link } from "react-router-dom";

/**
 * Ember logo — a teal ember/flame mark + the wordmark.
 * The flame is filled with the brand gradient (teal → mint) and carries
 * a soft cool glow so it reads as a lit ember.
 */
export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link className="wordmark" to={to} aria-label="Ember — home">
      <svg
        className="wordmark__mark"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="ember-flame"
            x1="12"
            y1="22"
            x2="12"
            y2="2"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5EE0C0" />
            <stop offset="1" stopColor="#B9F5E6" />
          </linearGradient>
        </defs>
        <path
          d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"
          fill="url(#ember-flame)"
        />
      </svg>
      <span className="ember">Ember</span>
    </Link>
  );
}
