
window.addEventListener("scroll", () => {
    const pageEnd = window.innerHeight + window.pageYOffset >= document.body.scrollHeight;
    if (pageEnd && currentPage < lastPage) {
        handleDisplayPosts(false, currentPage += 1);
    }
});

function handleDisplayPosts(reload, page) {
    loader(true)
    axios.get(`${baseUrl}posts?limit=50&page=${page}`)
    .then((result) => {
        lastPage = result.data.meta.last_page; reload = true, page = 1
            postsContainer.innerHTML = "";
            if (reload && currentPage > lastPage) {
                postsContainer.innerHTML = "";
            } 
            posts = result.data.data;
            for(post of posts) {
                let postTitle = "";
                if(post.title != null) {
                    postTitle = post.title;
                }
                let avatar = post.author.profile_image;
                let username = post.author.username;
                let postImage = post.image;
                let postTime = post.created_at;
                let postBody = post.body;
                let commentsCount = post.comments_count;
            let user = getCurrentUser();
            const isPostMine = user !== null && post.author.id === user.id;
            let content = `
                <div class="card mb-5 shadow-sm">
                    <div class="card-header d-flex align-items-center">
                    <div class="header-username" onclick=userId(${post.author.id})>
                    <img class="object-fit-cover rounded-circle border-primary" src="${avatar}" style="width: 40px; height: 40px; border: 1px solid; padding: 2px;" alt="header image">
                            <b class="px-1">${username}</b>
                        </div>
                        <i class="fa-solid fa-trash delete_post_icon ${isPostMine ? "" : "hidden"}" data-post='${JSON.stringify(post)}' onclick="deletePost(event)"></i>
                        <i class="fa-solid fa-pen-to-square update_post_icon ${isPostMine ? "" : "hidden"}" data-post='${JSON.stringify(post)}' onclick="editPost(event)"></i>
                        </div>
                    <div class="card-body" onclick="postClicked(${post.id})">
                        <img src="${postImage}" alt="post image" class="w-100">
                        <small class="text-light-emphasis">${postTime}</small>
                        <h3 class="text-center">${postTitle}</h3>
                        <p class="text-body">
                            ${postBody}
                        </p>
                        <hr>
                        <div class="d-flex align-items-center">
                            <i class="fa-regular fa-comment"></i>
                            <span class="ms-2">
                                ${commentsCount} Comments
                            </span>
                            <div id="tags-post-${post.id}">
                            </div>
                        </div>
                    </div>
                </div>
            `
            postsContainer.innerHTML += content;
        } 
    })
    .catch((error) => {
        console.log(Error(error))
    })
    .finally(() => loader(false))
}
handleDisplayPosts();

function userId(id) {
    window.location.href = `profile.html?userid=${id}`;
}


function editPost(event) {
    const post = JSON.parse(event.target.getAttribute('data-post'));
    console.log(post);
    handlePostPopup();
    document.getElementById("is_edit").value = post.id;
    document.querySelector(".post-overlay .popup-header h4").innerHTML = "Edit Post";
    document.querySelector(".post-overlay #post-title-input").value = post.title;
    document.querySelector(".post-overlay #post-description-input").value = post.body;
    document.getElementById("create_post_btn").innerHTML = "Update";
    handleDisplayPosts();
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
                handleDisplayPosts();
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


const scrollup = () => {
    let scrollup = document.getElementById("scroll-up");
    this.scrollY >= 350 ? scrollup.classList.add("show-scroll") 
    : scrollup.classList.remove("show-scroll");
};
window.addEventListener('scroll', scrollup);

let scrollupButton =document.getElementById("scroll-up");
scrollupButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
