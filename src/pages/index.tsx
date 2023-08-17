import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started in &lt;5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title={`State Backed - deploy invincible state machines to the cloud in one command`}
      description="The fastest path from business logic to production. Deploy a state machine then create instances of it and securely connect from multiple clients with our easy client- or server-side integrations.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <div className="container" style={{marginTop: 40}}>
          <div className="text--center">
            <h1>The fastest path from business logic to production</h1>
          </div>
        </div>
        <div className="container" style={{marginTop: 40}}>
          <ul className={styles.benefitList}>
            <li>Deploy any state machine</li>
            <li>Deploy infinite instances</li>
            <li>Leverage instance state and context as your storage layer</li>
            <li>Built-in multiplayer support - connect many clients to one machine instance</li>
            <li>Built-in realtime support - state updates instantly pushed to all clients</li>
            <li>Reliable, long-running timers for easy scheduling of jobs in seconds or years</li>
            <li>Always-on, unkillable instances with no cold starts or server crashes to worry about</li>
            <li>End-to-end security with simple, fine-grained authorization</li>
            <li>Automatically expose a simple, consistent, event-based frontend API with beautiful type safety</li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}
