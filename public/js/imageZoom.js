const lens = document.getElementsByClassName("magnifier-lens")[0];
const productImage = document.getElementsByClassName("product-image")[0];
const magnifiedImage = document.getElementsByClassName("magnified-image")[0];
const largeiamge = document.getElementById("largeImage");

function magnify(productImage, magnifiedImage) {
    lens.addEventListener("mousemove", moveLens);
    productImage.addEventListener("mousemove", moveLens);

    //take mouse out of image
    productImage.addEventListener("mouseout", leaveLens);

}
function moveLens(e) {
    let x, y, cx, cy;

    const product_img_rect = productImage.getBoundingClientRect();
    x = e.pageX - product_img_rect.left - lens.offsetWidth / 2;
    y = e.pageY - product_img_rect.top - lens.offsetHeight / 2;

    let max_xpos = product_img_rect.width - lens.offsetWidth;
    let max_ypos = product_img_rect.height - lens.offsetHeight;

    if (x > max_xpos) x = max_xpos;
    if (x < 0) x = 0;
    if (y > max_ypos) y = max_ypos;
    if (y < 0) y = 0;

    lens.style.cssText = `top:${y}px; left:${x}px`;

    // Center the mouse pointer within the lens
    const lensCenterX = x + lens.offsetWidth / 2;
    const lensCenterY = y + lens.offsetHeight / 2;
    document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-plus" viewBox="0 0 16 16"><path d="M8 1a.75.75 0 0 1 .75.75V7h5.25a.75.75 0 0 1 0 1.5H8V15a.75.75 0 0 1-1.5 0V8H1.75a.75.75 0 0 1 0-1.5H6V1.75A.75.75 0 0 1 7.75 1zm7.75 9h-5.5a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 0 1.5z"/></svg>) ${lensCenterX} ${lensCenterY}, auto`;

    // Check if the lens is at the border
    if (x === 0 || x === max_xpos || y === 0 || y === max_ypos) {
        // Hide the magnified image when the lens hits the border
        lens.classList.remove("active");
        magnifiedImage.classList.remove("active");
    } else {
        // Calculate the magnified_img and lens aspect ratio
        cx = magnifiedImage.offsetWidth / lens.offsetWidth;
        cy = magnifiedImage.offsetHeight / lens.offsetHeight;

        magnifiedImage.style.cssText = `background: url("${largeImage.src}")
      -${x * cx}px -${y * cy}px  /
      ${product_img_rect.width * cx}px ${product_img_rect.height * cy}px
      no-repeat;`;

        lens.classList.add("active");
        magnifiedImage.classList.add("active");
    }
}


function leaveLens() {
    lens.classList.remove("active")
    magnifiedImage.classList.remove("active")


}

magnify(productImage, magnifiedImage);

