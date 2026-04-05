const SUPABASE_CONFIG = {
  url: "https://bhfhtxmgncsyjlgsorap.supabase.co",
  key: "sb_publishable_BCqBJ0MozIk2u5GBy3fAZg_DVzKHyan"
};

const supabaseClient = supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key
);