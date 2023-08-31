handleUI();
let postsContainer = document.querySelector(".posts");
let baseUrl = 'https://tarmeezacademy.com/api/v1/';
let currentPage = 1;
let lastPage = 1;

function postClicked(postId) {
    window.location.href = `post.html?postId=${postId}`
}


let id = '';
function showPost() {
    const postUsername = document.querySelector(".post_username");
    const postAvatar = document.querySelector(".post_avatar");
    const PostImage = document.querySelector(".post_image");
    const postTime = document.querySelector(".post_time");
    const postTitle = document.querySelector(".post_title");
    const postBody = document.querySelector(".post_body");
    const postCommentsCount = document.querySelector(".post_comments");
    const postCommentAvatar = document.querySelector(".post_avatar_comment");
    const commentsContainer = document.querySelector("#comments")
    const urlParam = new URLSearchParams(window.location.search)
    id = urlParam.get('postId')
    axios.get(`${baseUrl}posts/${id}`)
    .then((response) => {
        const post = response.data.data;
        let postTitle = "";
        if(post.title != null) {
            postTitle = post.title;
        }
        console.log(post)
        const comments = post.comments;
        const author = post.author;
        document.querySelector(".post-author").innerHTML = `@${author.username}'s Post`;
        postUsername.innerHTML = author.username;
        postAvatar.src = author.profile_image;
        PostImage.src = post.image;
        postTime .innerHTML = post.created_at;
        postTitle.innerHTML = post.title;
        postBody.innerHTML = post.body;
        postCommentsCount.innerHTML = `${post.comments_count} Comments`;
        postCommentAvatar.src = author.profile_image;
        let commentsHTML = "";
        for (let comment of comments) {
            console.log(comment);
            let commentHTML = `
                <div class="comment">
                    <div class="d-flex align-items-center">
                        <img src="${comment.author.profile_image}" class="post_avatar_comment" alt="">
                        <p class="mb-0" style="font-size: 18px; font-weight: bold;">
                            ${comment.author.username}
                        </p>
                    </div>
                    <p class="mt-2" style="padding: 0 10px;">
                        ${comment.body}
                    </p>
                </div>
            `;
            commentsHTML += commentHTML;
        }
        commentsContainer.innerHTML = commentsHTML;
        let addCommentInput = `
            <label class="add_comment_holder">
                <input type="text" id="add_comment" placeholder="Add Comment" />
                <i class="fa-solid fa-paper-plane" id="send_comment"></i>
            </label>
        `;
        commentsContainer.innerHTML += addCommentInput;
        addNewComment()
        })
        .catch((error) => {
            dangerAlert(`${error.response.data.message} refresh the page`)
            console.log(error.response.data.message)
        })
        .finally(() => loader(false))
    }    
    showPost();



    function addNewComment() {
        const sendCommentButton = document.getElementById("send_comment");
        const addCommnetHolder = document.querySelector(".add_comment_holder");
        const token = localStorage.getItem("token");
        if(token === null) {
            addCommnetHolder.classList.add("hidden")
        }else {
            addCommnetHolder.classList.remove("hidden")
        }
        console.log(addCommnetHolder)
        sendCommentButton.addEventListener('click', () => {
            const inputComment = document.getElementById("add_comment").value;
            const params = {
                body: inputComment
            }
            const url = `${baseUrl}posts/${id}/comments`;
            axios.post(url, params, {
                headers: {
                    "authorization": `Bearer ${token}`
                }
            })
            .then((response) => {
                console.log(response.data)
                successAlert("The comment has been created succesfully");
                showPost();
            })
            .catch((error) => {
                const errorMsg = error.response.data.message;
                dangerAlert(errorMsg)
            })
        });
    }


    function createOrUpdatePost(postId, formData, headers, isCreate) {
        if (!isCreate) {
            formData.append("_method", "put");
        }
        loader(true);
        const url = isCreate ? `${baseUrl}posts` : `${baseUrl}posts/${postId}`;
        axios.post(url, formData, { headers })
            .then((response) => {
                console.log(response);
                const successMessage = isCreate ? "Post Created Successfully" : "Post Updated Successfully";
                successAlert(successMessage);
                let postOverlay = document.querySelector(".post-overlay");
                postOverlay.classList.remove("show-popup");
                handleDisplayPosts();
                getUser();
                getUserPosts();
            })
            .catch((error) => {
                console.log(error.response.data.message);
                dangerAlert(error.response.data.message);
            })
            .finally(() => loader(false))
    }
    document.getElementById("create_post_btn").addEventListener("click", () => {
        const postId = document.getElementById("is_edit").value;
        const isCreate = postId == null || postId == "";
        const postTitle = document.querySelector("#post-title-input").value;
        const postDescription = document.querySelector("#post-description-input").value;
        const postImage = document.querySelector("#image-input").files[0];
        const formData = new FormData();
        formData.append("body", postDescription);
        formData.append("title", postTitle);
        formData.append("image", postImage);
        const headers = {
            "authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
        };
        createOrUpdatePost(postId, formData, headers, isCreate);
    });
    


const icon = document.querySelector(".update_post_icon");
function handleUI() {
    const token = localStorage.getItem("token");
    const loginButton = document.querySelector("#login_btn");
    const registerButton = document.querySelector("#register_btn");
    const logoutButton = document.querySelector("#logout_btn");
    const userInfo = document.querySelector(".user-info");
    const userName = document.querySelector(".user-info p");
    if (token === null) {
        loginButton.classList.remove("hidden");
        registerButton.classList.remove("hidden");
        logoutButton.classList.add("hidden");
        userInfo.classList.add("hidden");
        addingPostButton("scale(0)")
    } else {
        const user = getCurrentUser();
        userName.innerHTML = user.username;
        document.querySelector(".user-image").src = user.profile_image;
        loginButton.classList.add("hidden");
        registerButton.classList.add("hidden");
        logoutButton.classList.remove("hidden");
        userInfo.classList.remove("hidden");
        addingPostButton("scale(1)")
    }
}
handleUI()



function handlePopup() {
    let loginBtn = document.getElementById("login_btn");
    let overlay = document.querySelector(".overlay");
    let closePopup = document.querySelector(".popup-header i");
    
    closePopup.addEventListener("click", () => {
        overlay.classList.remove("show-popup");
    });
    loginBtn.addEventListener('click', () => {
        overlay.classList.toggle("show-popup");
    });
    document.getElementById("closePopupBtn").addEventListener("click", () => {
        overlay.classList.toggle("show-popup");
    });
}
handlePopup()




function handleRegisterPopup() {
    let registerOverlay = document.querySelector(".register-overlay");
    let closeRegisterPopup = document.querySelector(".register-overlay .popup-header i");
        registerOverlay.classList.toggle("show-popup");
    closeRegisterPopup.addEventListener("click", () => {
        registerOverlay.classList.remove("show-popup");
    });
    document.getElementById("register_closePopupBtn").addEventListener("click", () => {
        registerOverlay.classList.remove("show-popup");
    });
}
document.getElementById("register_btn").addEventListener("click", handleRegisterPopup);





function handlePostPopup() {
    let postOverlay = document.querySelector(".post-overlay");
    let closePostPopup = document.querySelector(".post-overlay .popup-header i");
        postOverlay.classList.toggle("show-popup");
        closePostPopup.addEventListener("click", () => {
        postOverlay.classList.remove("show-popup");
    });
    document.getElementById("create_closePopupBtn").addEventListener("click", () => {
        postOverlay.classList.remove("show-popup");
    });
}
document.querySelector(".add_post_button").addEventListener("click", () => {
    createInnerText();
    handlePostPopup()
});
document.querySelector(".post-overlay .popup-header i").addEventListener("click", handlePostPopup);


function registrationButtonClicked() {
    loader(true)
    const name = document.getElementById("register_name_input").value;
    const username = document.getElementById("register_username_input").value;
    const password = document.getElementById("register_password_input").value;
    const profileImage = document.getElementById("profile-image").files[0];
    console.log(profileImage)
    console.log(name, username, password);
    if(!username || !password || !name) {
        return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("image", profileImage);
    const headers = {
        "Content-Type": "multipart/form-data"
    }
    const url = `${baseUrl}register`
    axios.post(url, formData, {
        headers: headers
    })
    .then((response) => {
        console.log(response.data)
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        successAlert("Registered Successfully!")
        handleUI();
    })
    .catch((error) => {
        dangerAlert(error.response.data.message)
        console.log(error.response.data.message)
    })
    .finally(() => loader(false))
}
document.getElementById("register_popup_btn").addEventListener("click", registrationButtonClicked);



function loginBtnClicked() {
    loader(true);
    const username = document.getElementById("username_input").value;
    const password = document.getElementById("password_input").value;
    
    if (!username || !password) {
        return;
    }
    
    const params = {
        "username": username,
        "password": password
    }
    
    const url = `${baseUrl}login`
    
    axios.post(url, params)
    .then((response) => {
        console.log(response.data.token)
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        successAlert("Logged In Successfully!")
        handleUI();
    })
    .catch((error) => {
        dangerAlert(error.response.data.message);
        console.log(error.response.data.message);
    })
    .finally(() => loader(false))
}




function logOut() {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will be logged out.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, log me out'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            console.log("Logged out successfully");
            handleUI();
            successAlert("Logged Out Successfuly");
        }
    });
}
document.getElementById("logout_btn").addEventListener("click", logOut);



let pass = document.getElementById("login_chk");
let chk = document.getElementById("password_input");
let registerChk = document.getElementById("register_chk");
let registerPasswordInput = document.getElementById("register_password_input");
function handlePassword(checkbox, passwordInput) {
    checkbox.onchange = function() {
        passwordInput.type = checkbox.checked ? "text" : "password";
    };
}
handlePassword(pass, chk);
handlePassword(registerChk, registerPasswordInput);


function loader(show = true) {
    if(show) {
        document.querySelector(".loader").classList.remove("loaded")
    }else {
        document.querySelector(".loader").classList.add("loaded")
    }
}


function getCurrentUser() {
    let user = null;
    const storedUser = localStorage.getItem("user");
    if(storedUser !== null) {
        user = JSON.parse(storedUser)
    }
    return user;
}


function addingPostButton(styleValue) {
    const addPostButton = document.querySelector(".add_post_button");
    addPostButton.style.transform = styleValue;
}





document.querySelector(".navbar-brand").addEventListener('click', () => {
    window.location.href = "index.html"
});

if (window.location.pathname === '/post.html') {
    document.querySelector(".goback_btn").addEventListener('click', () => {
        window.location.href = "index.html"
    });    
}

function profilePath() {
    document.querySelector(".nav-link[data-set='profile']").addEventListener("click", () => {
        const user = getCurrentUser();
        if(user && user.id) {
        window.location = `profile.html?userid=${user.id}`;
        }else {
            dangerAlert("Please log in to access the profile");
        }
    })
}
profilePath();

function successAlert(message) {
    const succesAlert = document.querySelector(".success-alert");
    succesAlert.style.transform = "translateY(0)";
    document.querySelector(".overlay").classList.remove("show-popup");
    document.querySelector(".register-overlay").classList.remove("show-popup");
    setTimeout(() => {
        succesAlert.style.transform = "translateY(300px)";
    }, 3000);
    document.querySelector(".success-alert i").addEventListener("click", () => {
        succesAlert.style.transform = "translateY(300px)";
    })
    let succesElement = document.querySelector(".success-alert .show-message");
    succesElement.textContent = message;
}


function dangerAlert(message) {
    let dangerAlert = document.querySelector(".danger-alert");
    let alertMessage = dangerAlert.querySelector(".danger-alert-message");
    alertMessage.textContent = message;
    dangerAlert.style.transform = "translateY(0)";
    setTimeout(() => {
        dangerAlert.style.transform = "translateY(-300px)";
    }, 2500);
}

