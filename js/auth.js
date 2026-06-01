    console.log("1. auth.js carregado: Iniciando conexão com Supabase...");

    const supabaseUrl = 'https://gtopbsewqoqejljopgla.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0b3Bic2V3cW9xZWpsam9wZ2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzA1OTAsImV4cCI6MjA5NTU0NjU5MH0.5iQPCR_Kg1CZdUS3CCccE37sCO-KoZ66oT3yOOnJB_g';
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    console.log("2. Supabase conectado e pronto!");