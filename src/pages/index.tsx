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
            <li>Spawn unlimited instances</li>
            <li>Leverage instance state and context as your storage layer or easily call into your own backend or other services</li>
            <li>Built-in multiplayer support - connect many clients to one machine instance</li>
            <li>Built-in realtime support - state updates instantly pushed to all clients</li>
            <li>Reliable, long-running timers for easy scheduling of jobs in seconds or years</li>
            <li>Always-on, persistent cloud actors make it easy to code reliable long-running workflows and responsive backends</li>
            <li>End-to-end security with simple, fine-grained authorization</li>
            <li>Automatically expose a simple, consistent, event-based frontend API with beautiful type safety</li>
          </ul>
        </div>
        <div className="container text--center" style={{marginTop: 40}}>
          <Link
            className="button button--primary button--lg"
            to="/docs/intro">
            Deploy your backend for free in &lt;5 mins
          </Link>
        </div>
        <div className="container text--center" style={{ marginTop: 40 }}>
        </div>
        <div className="container text--center" style={{ marginTop: 40 }}>
          <div id="mc_embed_shell">
            <link href="//cdn-images.mailchimp.com/embedcode/classic-061523.css" rel="stylesheet" type="text/css" />
            <style type="text/css">{`
              #mc_embed_signup{false;clear:left; font:14px Helvetica,Arial,sans-serif; width: 600; margin: auto; max-width: 600px; overflow: hidden;}
              #mc_embed_signup .helper_text { background: none; }
            `}
            </style>
            <div id="mc_embed_signup">
              <form action="https://teampando.us8.list-manage.com/subscribe/post?u=dec43cbfe556d982657100961&id=3616b8513f&f_id=00cb72e0f0" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank">
                <div id="mc_embed_signup_scroll"><h2>Stay up to date with the latest from State Backed</h2>
                  <div className="indicates-required"><span className="asterisk">*</span> indicates required</div>
                  <div className="mc-field-group"><label htmlFor="mce-EMAIL">Email Address <span className="asterisk">*</span></label><input type="email" name="EMAIL" className="required email" id="mce-EMAIL" required={true} defaultValue="" /><span id="mce-EMAIL-HELPERTEXT" className="helper_text"></span></div>
                  <div id="mce-responses" className="clear">
                    <div className="response" id="mce-error-response" style={{ display: "none" }}></div>
                    <div className="response" id="mce-success-response" style={{ display: "none" }}></div>
                  </div><div aria-hidden="true" style={{ position: "absolute", left: -5000 }}><input type="text" name="b_dec43cbfe556d982657100961_3616b8513f" tabIndex={-1} readOnly value="" /></div><div className="clear"><input type="submit" name="subscribe" id="mc-embedded-subscribe" className="button" value="Subscribe" style={{backgroundColor: "#000000"}}/></div>
                </div>
              </form>
            </div>
            <script type="text/javascript" src="//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js"></script>
            <script type="text/javascript">{`(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';fnames[3]='ADDRESS';ftypes[3]='address';fnames[4]='PHONE';ftypes[4]='phone';}(jQuery));var $mcj = jQuery.noConflict(true);`}</script>
          </div>
        </div>
      </main>
    </Layout>
  );
}
