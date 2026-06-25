import { redirect } from 'next/navigation';

export default function Home() {
  // This automatically moves the user straight to your login page
  redirect('/login');
}