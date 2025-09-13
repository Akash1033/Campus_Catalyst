import { supabase } from '../supabase';

export async function notifyAllStudentsOfNewEvent(event: {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
}) {
  // 1. Fetch all student emails
  const { data: students, error } = await supabase
    .from('users')
    .select('email')
    .eq('role', 'student');

  if (error) {
    console.error('Error fetching student emails:', error);
    return;
  }

  if (!students || students.length === 0) {
    console.log('No students found to notify.');
    return;
  }

  // 2. Prepare email content
  const subject = `New Event Created: ${event.title}`;
  const text = `A new event "${event.title}" has been created!\n\nDescription: ${event.description}\nDate: ${event.start_time} - ${event.end_time}\nLocation: ${event.location}`;

  // 3. Log emails (replace this with real email sending logic)
  students.forEach(student => {
    console.log(`[EMAIL] To: ${student.email}\nSubject: ${subject}\n${text}`);
  });

  // TODO: Integrate with a real email service (e.g., SendGrid, Mailgun, SMTP)
} 