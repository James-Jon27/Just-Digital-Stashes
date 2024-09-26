import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getImages } from "../../redux/image";
import "./HomePage.css";
import OpenModalImageItem from "../ImageModal/OpenModalImageItem";
import ImageModal from "../ImageModal/ImageModal";

function HomePage() {
	const [colNum, setColNum] = useState(parseInt((window.innerWidth - 40) / 340));

	useEffect(() => {
		function handleColNum() {
			setColNum(parseInt((window.innerWidth - 40) / 340));
		}

		window.addEventListener("resize", handleColNum);
		return () => window.removeEventListener("resize", handleColNum);
	}, []);

	const dispatch = useDispatch();
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		dispatch(getImages()).then(() => setIsLoaded(true));
	}, [dispatch]);

	const images = Object.values(useSelector((state) => state.image));

	return (
		<div className="grid" style={{ "--colNum": colNum }}>
			{isLoaded &&
				images.map((image) => (
					<div key={image.id} style={{ cursor: "pointer" }}>
						<OpenModalImageItem
							modalComponent={
								<ImageModal id={image.id} /> // Pass detail directly to the modal
							}
							src={image.url}
							alt={image.title ? image.title : "Image"}
						/>
					</div>
				))}
		</div>
	);
}

export default HomePage;
