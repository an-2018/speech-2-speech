import { Translator } from '@/components/Translator';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Translator />
    </main>
  );
}