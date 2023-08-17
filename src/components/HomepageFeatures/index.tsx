import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Build.',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Build your business logic as an XState state machine.
        You know, the stuff your users actually care about.
        Build visually with Stately or code-first with XState.
        Don't worry about persistence, scalability, consistency, etc.
        You just bring your logic and we'll take care of the rest.
      </>
    ),
  },
  {
    title: 'Deploy.',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Deploy your logic to the State Backed cloud where it will be
        ready to run as invincible, consistent, secure, always-on machine instances.
        We store every version of your machine and support simple migrations
        for easy upgrades and rollbacks, even of long-lived instances.
      </>
    ),
  },
  {
    title: 'Connect.',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Create and connect to your machine instances, securely, with our 2-line
        client- or server-side integrations.
        Multiplayer and real-time support is built-in for every instance.
        Bring your own authentication and sleep soundly with end-to-end,
        fine-grained authorization of every request.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
