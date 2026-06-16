<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>404 - Fight Not Found</title>

<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap" rel="stylesheet">

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    background:#0a0a0a;
    color:white;
    font-family:'Oswald',sans-serif;
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
}

.bg{
    position:fixed;
    inset:0;
    background:
    radial-gradient(circle at center,
    rgba(255,0,0,.15),
    transparent 60%);
}

.container{
    text-align:center;
    z-index:2;
    max-width:800px;
    padding:20px;
}

.error{
    font-size:10rem;
    color:#ff0000;
    font-weight:700;
    text-shadow:0 0 30px rgba(255,0,0,.5);
}

.title{
    font-size:3rem;
    margin-bottom:10px;
}

.subtitle{
    color:#999;
    margin-bottom:35px;
    font-size:1.2rem;
}

.btn{
    display:inline-block;
    background:#d20a11;
    color:white;
    text-decoration:none;
    padding:15px 40px;
    border-radius:8px;
    font-size:1.2rem;
    transition:.2s;
}

.btn:hover{
    transform:translateY(-3px);
    background:#ff0000;
}

.cage{
    position:absolute;
    inset:0;
    background-image:
    repeating-linear-gradient(
        45deg,
        transparent,
        transparent 35px,
        rgba(255,255,255,.03) 35px,
        rgba(255,255,255,.03) 37px
    );
}
</style>
</head>
<body>

<div class="bg"></div>
<div class="cage"></div>

<div class="container">
    <div class="error">404</div>
    <div class="title">FIGHT NOT FOUND</div>
    <div class="subtitle">
        This page got knocked out in Round 1.
    </div>

    <a href="/" class="btn">
        RETURN TO THE OCTAGON
    </a>
</div>

</body>
</html>