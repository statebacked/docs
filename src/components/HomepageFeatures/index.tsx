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
    title: 'Bundles of state and logic',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        It shouldn't be so difficult to set up persistent state and build logic
        on top of it. State Backed gets the state management out of the way and
        lets you build your logic declaratively and visually, in XState.
      </>
    ),
  },
  {
    title: 'Focus on What Matters',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Your users don't care about your infrastructure or your datastore.
        Your users want your business logic, applied consistently and securely
        to their data. State Backed gets everything out of the way so you can
        focus on your business logic.
      </>
    ),
  },
  {
    title: 'Powered by XState',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        XState is loved by millions of engineers as the best way to manage
        complex (or simple) logic and state on the frontend. With State Backed,
        you can deploy exactly the same XState state machines as a backend
        API in one command.
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
        <h3>{title}</h3>
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
