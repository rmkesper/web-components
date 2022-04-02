<?php 
/**
 * Get Tailwind CSS from html view, capture v-bind:class, :class and class attributes
 */
$exp = explode("\\", getcwd());
$component = $exp[ count($exp)-1 ];
if(!file_exists("./" . $component . ".html")) {
	die('Expecting "' . $component . '.html" in dir "' . $component . '"');
}
if(isset($_POST) && isset($_POST["css"])) {
	file_put_contents($component . ".css", $_POST["css"]);
} else {
	$tw = file_get_contents("https://cdn.tailwindcss.com");
	# replace the search for the class property by additional properties
	$tw = str_replace(
		'document.querySelectorAll("[class]")',
		'[...document.querySelectorAll("[class]"),...document.querySelectorAll("[v-bind\\\\:class]"),...document.querySelectorAll("[\\\\:class]")]',
		$tw
	);
	# ... and update the following for loop to use the previous defined search properties
	$tw = str_replace(
		'r.classList',
		'[...(r.getAttribute("class") ? r.getAttribute("class").split(" ") : []),...(r.getAttribute("v-bind:class") ? r.getAttribute("v-bind:class").split(" ") : []),...(r.getAttribute(":class") ? r.getAttribute(":class").split(" ") : [])]',
		$tw
	);
?>
<html>
	<head>
		<script>
		<?php echo $tw; ?>
		</script>
		<script>
			tailwind.config = {
				darkMode: "class",
			}
		</script>
	</head>
	<body>
		<?php include $component . ".html"; ?>
	</body>
	<script>
	let s = document.querySelector("style")
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "css.php", true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.send("css="+s.innerText);
	</script>
</html>
<?php }?>