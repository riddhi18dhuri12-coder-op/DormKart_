// js/auth.js

// --- SIGN UP LOGIC ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page reload
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const idFile = document.getElementById('studentId').files[0];
        const messageDisplay = document.getElementById('authMessage');

        messageDisplay.style.color = "#14B8A6";
        messageDisplay.innerText = "Creating account... Please wait.";

        try {
            // 1. Create the user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (authError) throw authError;

            // 2. Upload the Student ID to Supabase Storage
            const fileExt = idFile.name.split('.').pop();
            const fileName = `${authData.user.id}-${Math.random()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('student_ids')
                .upload(fileName, idFile);

            if (uploadError) throw uploadError;

            // 3. Get the public URL for the uploaded ID
            const { data: urlData } = supabase.storage
                .from('student_ids')
                .getPublicUrl(fileName);

            // 4. Save everything to your 'profiles' table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    { 
                        id: authData.user.id, 
                        full_name: fullName, 
                        college_email: email,
                        id_card_url: urlData.publicUrl 
                    }
                ]);

            if (profileError) throw profileError;

            messageDisplay.style.color = "green";
            messageDisplay.innerText = "Success! Redirecting to dashboard...";
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);

        } catch (error) {
            messageDisplay.style.color = "#EF4444";
            messageDisplay.innerText = "Error: " + error.message;
        }
    });
}

// --- LOG IN LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageDisplay = document.getElementById('authMessage');

        messageDisplay.style.color = "#14B8A6";
        messageDisplay.innerText = "Logging in...";

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            messageDisplay.style.color = "#EF4444";
            messageDisplay.innerText = "Error: " + error.message;
        } else {
            window.location.href = "dashboard.html";
        }
    });
}
