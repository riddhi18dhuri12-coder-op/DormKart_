// js/products.js

// -----------------------------------------
// LOGIC FOR ADDING A PRODUCT
// -----------------------------------------
const addProductForm = document.getElementById('addProductForm');

if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const price = document.getElementById('price').value;
        const originalPrice = document.getElementById('originalPrice').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const imageFile = document.getElementById('productImage').files[0];
        const msg = document.getElementById('uploadMessage');
        const submitBtn = document.getElementById('submitProductBtn');

        msg.style.color = "#14B8A6";
        msg.innerText = "Uploading your item...";
        submitBtn.disabled = true;

        try {
            // 1. Get current logged-in user
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            const sellerId = userData.user.id;

            // 2. Upload Image to Storage
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('product_images')
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;

            // 3. Get Public URL of Image
            const { data: urlData } = supabase.storage
                .from('product_images')
                .getPublicUrl(fileName);
            const imageUrl = urlData.publicUrl;

            // 4. Save Listing to Database
            const { error: dbError } = await supabase
                .from('listings')
                .insert([
                    {
                        seller_id: sellerId,
                        title: title,
                        price: price,
                        original_price: originalPrice,
                        category: category,
                        description: description,
                        image_url: imageUrl,
                        status: 'Available'
                    }
                ]);

            if (dbError) throw dbError;

            msg.style.color = "green";
            msg.innerText = "Item listed successfully!";
            
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {
            msg.style.color = "#EF4444";
            msg.innerText = "Error: " + error.message;
            submitBtn.disabled = false;
        }
    });
}

// -----------------------------------------
// LOGIC FOR FETCHING PRODUCTS (DASHBOARD)
// -----------------------------------------
const productsContainer = document.getElementById('products-container');

if (productsContainer) {
    async function loadProducts() {
        try {
            // Fetch items from Supabase where status is Available
            const { data: listings, error } = await supabase
                .from('listings')
                .select('*')
                .eq('status', 'Available')
                .order('created_at', { ascending: false });

            if (error) throw error;

            productsContainer.innerHTML = ''; // Clear loading text

            if (listings.length === 0) {
                productsContainer.innerHTML = `<p style="grid-column: span 2; text-align: center; color: #64748B;">No items available yet. Be the first to list!</p>`;
                return;
            }

            // Generate HTML for each item
            listings.forEach(item => {
                
                // Calculate discount percentage
                let discountBadge = '';
                if(item.original_price > item.price) {
                    const discount = Math.round(((item.original_price - item.price) / item.original_price) * 100);
                    discountBadge = `<span style="position: absolute; top: 10px; left: 10px; background: #EF4444; color: white; padding: 4px 8px; font-size: 11px; font-weight: bold; border-radius: 15px;">-${discount}%</span>`;
                }

                const cardHtml = `
                    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.06); position: relative; cursor: pointer;">
                        ${discountBadge}
                        <div style="height: 140px; background: #F1F5F9; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            <img src="${item.image_url}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="padding: 12px;">
                            <h3 style="font-size: 14px; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${item.title}</h3>
                            <div style="display: flex; gap: 6px; align-items: baseline;">
                                <span style="font-weight: 700; font-size: 16px; color: #14B8A6;">₹${item.price}</span>
                                ${item.original_price > item.price ? `<span style="text-decoration: line-through; color: #94A3B8; font-size: 12px;">₹${item.original_price}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
                productsContainer.innerHTML += cardHtml;
            });

        } catch (error) {
            console.error("Error fetching products:", error);
            productsContainer.innerHTML = `<p style="grid-column: span 2; text-align: center; color: #EF4444;">Failed to load items.</p>`;
        }
    }

    // Call the function to load products when dashboard loads
    loadProducts();
}
