import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://lutstmiitytmvxmaorkh.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventPayload {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_capacity: number;
  image_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { event } = await req.json() as { event: EventPayload };
    
    if (!event || !event.id || !event.title) {
      return new Response(
        JSON.stringify({ error: "Invalid request: Missing event data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create a Supabase client to fetch users
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all user emails from the profiles table
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, email, name")
      .eq("is_approved", true);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch users" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Format the event date for the email
    const eventDate = new Date(event.start_time);
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(eventDate);

    // Create a formatted description (truncated if too long)
    const shortDescription = event.description.length > 150
      ? event.description.substring(0, 147) + "..."
      : event.description;

    // Build the event URL
    const eventUrl = ${req.headers.get("origin") || "https://campus-catalyst-app.com"}/events/${event.id};
    
    // Batch process emails
    console.log(Sending notification emails to ${users.length} users about new event: ${event.title});
    
    // For each user, send a notification email
    const emailPromises = users.map(async (user) => {
      if (!user.email) return null;
      
      try {
        const { data, error } = await resend.emails.send({
          from: "Campus Catalyst <notifications@campus-catalyst.org>",
          to: [user.email],
          subject: New Event: ${event.title},
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4f46e5;">New Event Added: ${event.title}</h2>
              
              ${event.image_url ? <img src="${event.image_url}" alt="${event.title}" style="max-width: 100%; border-radius: 8px; margin-bottom: 20px;"> : ''}
              
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">${shortDescription}</p>
              
              <div style="margin-bottom: 24px;">
                <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> ${event.location}</p>
                <p style="margin: 4px 0;"><strong>Capacity:</strong> ${event.max_capacity} attendees</p>
              </div>
              
              <a href="${eventUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Event Details</a>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                If you're no longer interested in receiving these notifications, please update your preferences in your account settings.
              </p>
            </div>
          `,
        });

        if (error) {
          console.error(Failed to send email to ${user.email}:, error);
          return { success: false, email: user.email, error };
        }

        return { success: true, email: user.email };
      } catch (emailError) {
        console.error(Error sending email to ${user.email}:, emailError);
        return { success: false, email: user.email, error: emailError };
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    
    // Count successful and failed emails
    const successful = results.filter(r => r && r.success).length;
    const failed = results.filter(r => r && !r.success).length;

    console.log(Successfully sent ${successful} emails, ${failed} failed);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: Notification sent to ${successful} users. Failed: ${failed}. 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in notify-new-event function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});