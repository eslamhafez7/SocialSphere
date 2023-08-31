
function getCurrentUserId() {
    const urlQueryParam = new URLSearchParams(window.location.search);
    const id = urlQueryParam.get("userid");
    return id;
}
const ID = getCurrentUserId();

getUser();
function getUser() {
    const userPostsImg = document.querySelector(".user_posts_img");
    const userPostsUsername = document.querySelector(".user_posts_username");
    const userPostsName = document.querySelector(".user_posts_name");
    const userPostsEmail = document.querySelector(".user_posts_email");
    const userPostsCount = document.querySelector(".user_posts_count");
    const userCommentsCount = document.querySelector(".user_comments_count");
axios.get(`${baseUrl}users/${ID}`)
    .then((response) => {
        const user = response.data.data;
        console.log(user)
        userPostsImg.src = user.profile_image;
        userPostsUsername.innerHTML = user.username;
        userPostsName.innerHTML = user.name;
        userPostsEmail.innerHTML = user.email  === null ? "Undefined" : user.email;
        userPostsCount.innerHTML = user.posts_count;
        userCommentsCount.innerHTML = user.comments_count;
    })
}

function getUserPosts() {
    const url = `${baseUrl}users/${ID}/posts`;
    const userPostsContainer = document.querySelector(".user_posts_container");
    const userPostsTitle = document.querySelector(".user_title"); 
    axios.get(url)
    .then((response) => {
        const userPosts = response.data.data;
        console.log(userPosts)
        userPostsContainer.innerHTML = '';
        for(post of userPosts) {
            userPostsTitle.innerHTML = `${post.author.name}'s Posts`;
            let user = getCurrentUser();
            const isPostMine = user !== null && post.author.id === user.id;
            let content = `
                <div class="card mb-5 shadow-sm">
                    <div class="card-header d-flex align-items-center">
                    <div class="header-username">
                    <img class="object-fit-cover rounded-circle border-primary" src="${post.author.profile_image}" style="width: 40px; height: 40px; border: 1px solid; padding: 2px;" alt="header image">
                            <b class="px-1">${post.author.username}</b>
                        </div>
                        <i class="fa-solid fa-trash delete_post_icon ${isPostMine ? "" : "hidden"}" data-post='${JSON.stringify(post)}' onclick="deletePost(event)"></i>
                        <i class="fa-solid fa-pen-to-square update_post_icon ${isPostMine ? "" : "hidden"}" data-post='${JSON.stringify(post)}' onclick="editPost(event)"></i>
                        </div>
                    <div class="card-body" onclick="postClicked(${post.id})">
                        <img src="${post.image}" alt="post image" class="w-100">
                        <small class="text-light-emphasis">${post.created_at}</small>
                        <h3 class="text-center">${post.title}</h3>
                        <p class="text-body">
                            ${post.body}
                        </p>
                        <hr>
                        <div class="d-flex align-items-center">
                            <i class="fa-regular fa-comment"></i>
                            <span class="ms-2">
                                ${post.comments_count} Comments
                            </span>
                            <div id="tags-post-${post.id}">
                            </div>
                        </div>
                    </div>
                </div>
            `
            userPostsContainer.innerHTML += content;
        }
        getUser();
        handleDisplayPosts();
    })
}
getUserPosts();

function editPost(event) {
    const post = JSON.parse(event.target.getAttribute('data-post'));
    console.log(post);
    handlePostPopup();
    getUserPosts();
    document.getElementById("is_edit").value = post.id;
    document.querySelector(".post-overlay .popup-header h4").innerHTML = "Edit Post";
    document.querySelector(".post-overlay #post-title-input").value = post.title;
    document.querySelector(".post-overlay #post-description-input").value = post.body;
    document.getElementById("create_post_btn").innerHTML = "Update";
}

function deletePost(event) {
    const post = JSON.parse(event.target.getAttribute('data-post'));
    console.log(post);
    const token = localStorage.getItem("token");
    let url = `${baseUrl}posts/${post.id}`
    const headers = {
        "Content-Type": "multipart/form-data",
        "authorization": `Bearer ${token}`
    }
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will permanently delete this post .',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#dd3333d1',
        confirmButtonText: 'Yes, delete'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(url, {
                headers: headers
            })
            .then((response) => {
                successAlert("Post deleted successfully")
                getUserPosts();
                console.log(response)
            })
            .catch((error) => {
                dangerAlert(error.response.data.message)
            })
        }
    });
}

function createInnerText() {
    document.getElementById("is_edit").value = "";
    document.querySelector(".post-overlay .popup-header h4").innerHTML = "Create A New Post";
    document.querySelector(".post-overlay #post-title-input").value = "";
    document.querySelector(".post-overlay #post-description-input").value = "";
    document.getElementById("create_post_btn").innerHTML = "Create";
}