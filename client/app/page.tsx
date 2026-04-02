"use client";

import styles from "./landing.module.css";
import Link from "next/link";
<Link href="/login">
<button className={styles.loginBtn}>Login</button>
</Link>;

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <h2 className={styles.logo}>⛳ Golf Charity</h2>

        <div className={styles.navLinks}>
          <span>Home</span>
          <span>Auctions</span>
          <span>Events</span>
        </div>
        <div className={styles.navActions}>
          <Link href="/login">
            <button className={styles.loginBtn}>Login</button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.overlay}></div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Once-in-a-lifetime Golf Experiences <br /> for Charity
          </h1>

          <p className={styles.heroSubtitle}>Play. Compete. Win. Give back.</p>

          <Link href="/users/dashboard">
            <button className={styles.ctaBtn}>Get Started</button>
          </Link>
        </div>
      </section>
    </div>
  );
}
