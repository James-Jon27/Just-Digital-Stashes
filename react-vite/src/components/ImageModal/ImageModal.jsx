import { useDispatch, useSelector } from "react-redux";
import { deleteImage, getImageById, userImages } from "../../redux/image";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useModal } from "../../context/Modal";
import { deleteComment, getImageComments, postComment } from "../../redux/comment";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit, FaCheck } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import { addFavToUser, delFavFromUser, getFavoritesThunk } from "../../redux/favorites";
import { stashAnImage, unStashAnImage } from "../../redux/stash";
import "./ImageModal.css";

function ImageModal({ id }) {
	const dispatch = useDispatch();
	const nav = useNavigate();
	const { closeModal } = useModal();
	const sessionUser = useSelector((state) => state.session.user);
	const imageSelect = useSelector((state) => state.image);
	const commentSelect = useSelector((state) => state.comment);
	const userFaves = useSelector((state) => state.favorite);
	const comments = Object.values(commentSelect);
	const [loading, setLoading] = useState(false);
	const [image, setImage] = useState(null);
	const [imageStashes, setImageStashes] = useState(new Set());
	const [comment, setComment] = useState("");
	const [favoriteCheck, setFavoriteCheck] = useState(false);
	const [faveCount, setFaveCount] = useState(0);
	const [confirmDeleteId, setConfirmDeleteId] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [stashes, setStashes] = useState([]);
	const [hold, setHold] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			await dispatch(getImageById(id));
			await dispatch(getImageComments(id));
			const imageData = imageSelect[id];

			if (imageData) {
				setImage(imageData);
				const initStashSet = new Set();
				const imgStash = Object.values(imageData.Stashes);
				imgStash.filter((stash) => !stash.errors).forEach((stash) => initStashSet.add(stash.id));
				setImageStashes(initStashSet);
			}
			setLoading(true);
		};

		if (!loading && id && imageSelect) {
			fetchData();
		}
	}, [dispatch, id, imageSelect]);

	useEffect(() => {
		if (image && sessionUser) {
			const isFavorite = image.Favorites.some((fav) => fav.user_id === sessionUser.id);
			setFavoriteCheck(isFavorite);
			setFaveCount(image.Favorites.length);
			setStashes(Object.values(sessionUser.Stashes));
		}
	}, [sessionUser, image]);

	const refetch = async () => {
		if (image) {
			await dispatch(getImageComments(image.id));
		}
	};

	const handleCommentSubmit = async (e) => {
		e.preventDefault();
		const form = new FormData();
		form.append("comment", comment);
		const res = await dispatch(postComment(image.id, form));

		if (res) {
			refetch();
			setComment("");
		}
	};

	const deleteCommentHandler = async (commentId) => {
		try {
			await dispatch(deleteComment(commentId));
			refetch();
		} catch (error) {
			console.error("Error deleting comment:", error);
		}
	};

	const handleDelete = async (e) => {
		e.preventDefault();
		await dispatch(deleteImage(id));
		closeModal();
		await dispatch(userImages(sessionUser.id));
	};

	const handleEdit = async (e) => {
		e.preventDefault();
		closeModal();
		nav(`/images/${id}/edit`);
	};

	const drop = () => {
		document.getElementById("myDropdown").classList.toggle("show");
	};

	const checkbox = (stashId) => {
		const currChecks = new Set(imageStashes);
		if (currChecks.has(stashId)) {
			currChecks.delete(stashId);
			uncheckStash(stashId);
		} else {
			currChecks.add(stashId);
			checkStash(stashId);
		}
		setImageStashes(currChecks);
	};
	const checkStash = async (stashId) => {
		if (!sessionUser) return;

		const imgStash = Object.values(image.Stashes);
		const alreadyThere = imgStash.some((stash) => imageStashes.has(stash.id));
		if (!alreadyThere) {
			await dispatch(stashAnImage(image.id, stashId));
		} else checkStash(stashId);
	};

	const uncheckStash = async (stashId) => {
		if (!sessionUser) return;

		const imgStash = Object.values(image.Stashes);
		const alreadyThere = imgStash.some((stash) => imageStashes.has(stash.id));
		if (alreadyThere) {
			await dispatch(unStashAnImage(image.id, stashId));
		} else uncheckStash(stashId);
	};

	const favoriteToggle = async (existingFavorite) => {
		setHold(true);
		if (sessionUser) {
			if (existingFavorite) {
				await dispatch(delFavFromUser(existingFavorite.id));
				setFaveCount((prevCount) => prevCount - 1);
				setFavoriteCheck(false);
			} else {
				await dispatch(addFavToUser(image.id));
				setFaveCount((prevCount) => prevCount + 1);
				setFavoriteCheck(true);
			}

			await dispatch(getFavoritesThunk(sessionUser.id));
		}
		setHold(false);
	};

	const favoriteButton = () => {
		const existingFavorite = Object.values(userFaves).find((fav) => fav.image_id === image.id);
		if (hold) {
			return (
				<div>
					<button
						style={
							favoriteCheck ? { cursor: "pointer", background: "#DB570F" } : { cursor: "pointer" }
						}
						className="favorite">
						🩵🩵🩵
					</button>
				</div>
			);
		} else
			return (
				<div>
					<button
						onClick={(e) => {
							e.stopPropagation(), favoriteToggle(existingFavorite);
						}}
						style={
							favoriteCheck
								? { fontSize: "2rem", cursor: "pointer", background: "#DB570F" }
								: { fontSize: "2rem", cursor: "pointer" }
						}
						className="favorite">
						Favorite
					</button>
				</div>
			);
	};

	const handleClickOutside = () => {
		if (confirmDeleteId) {
			setConfirmDeleteId(null);
		}
	};

	const deleteConfirm = (id) => {
		if (confirmDeleteId === id) {
			return (
				<div>
					<button
						className="delete"
						style={{ height: "58px", width: "60px", marginRight: "10px" }}
						onClick={() => {
							deleteCommentHandler(id);
						}}>
						Confirm
					</button>
					<button
						className="delete"
						style={{ height: "58px", width: "58px", marginLeft: "10px" }}
						onClick={() => {
							setConfirmDeleteId(null);
						}}>
						Cancel
					</button>
				</div>
			);
		} else {
			return (
				<button
					className="delete"
					onClick={() => {
						setConfirmDeleteId(id);
					}}>
					Delete
				</button>
			);
		}
	};

	const deleteMe = (bool) => {
		if (bool) {
			return (
				<div style={{ display: "flex" }}>
					<button
						onClick={(e) => handleDelete(e)}
						style={{ cursor: "pointer", background: "none", border: "none" }}>
						<FaCheck style={{ height: "35px", width: "35px" }} />
					</button>
					<button
						onClick={() => setConfirmDelete(false)}
						style={{ cursor: "pointer", background: "none", border: "none" }}>
						<GiCancel style={{ height: "35px", width: "35px" }} />
					</button>
				</div>
			);
		} else {
			return (
				<div style={{ display: "flex" }}>
					<button
						onClick={() => setConfirmDelete(true)}
						style={{ cursor: "pointer", background: "none", border: "none" }}>
						<MdDeleteForever style={{ height: "35px", width: "35px" }} />
					</button>
					<button
						onClick={(e) => handleEdit(e)}
						style={{ cursor: "pointer", background: "none", border: "none" }}>
						<FaEdit style={{ height: "35px", width: "35px" }} />
					</button>
				</div>
			);
		}
	};

	if (!loading || !image) {
		return <h1 style={{ color: "white" }}>Loading...💥</h1>;
	}

	const owner = image.User;
	const labels = image.Labels.map((label, el) => image.Labels[el].name);

	return (
		<div className="imgPage" onClick={handleClickOutside}>
			<div className="imgUser">
				<div className="img-modal">
					<img src={image.url} alt={image.title} />
				</div>
				<div className="userInt">
					<div className="prof">
						<NavLink
							className="circle-modal"
							to={`user/${owner.id}/posted-images`}
							onClick={closeModal}>
							{owner.firstName[0]}
						</NavLink>
						<h2>{owner.username}</h2>
						{sessionUser && sessionUser.id == owner.id && deleteMe(confirmDelete)}
					</div>
					<div className="stashDropdown">
						{sessionUser && (
							<div className="dropdown">
								<button style={{ cursor: "pointer" }} className="dropbtn" onClick={drop}>
									Add to Stash 👇
								</button>
								{stashes && stashes.length > 0 && stashes[0] !== "Stashes not found" ? (
									<div id="myDropdown" className="dropdown-content">
										{stashes.map((stash) => {
											return (
												<label key={stash.id}>
													<input
														type="checkbox"
														checked={imageStashes.has(stash.id)}
														onChange={(e) => checkbox(stash.id)}
													/>
													{stash.name}
												</label>
											);
										})}
									</div>
								) : (
									<div id="myDropdown" className="dropdown-content">
										<label style={{ textAlign: "center" }}>No User Stashes</label>
									</div>
								)}
							</div>
						)}
					</div>
					{sessionUser && favoriteButton()}
				</div>
			</div>
			<span className="imgInfo">
				<div>
					{image.title && <h1>{image.title}</h1>}
					{image.description && image.description !== "null" && <p>{image.description}</p>}
				</div>
				<div>
					<h3>❤️ {faveCount} Favorites</h3>
					<div style={{ display: "flex", gap: "10px" }}>
						{labels &&
							labels.map((label, el) => {
								if (label !== "undefined") {
									return <h4 key={el}>{label}</h4>;
								}
							})}
					</div>
				</div>
			</span>
			<span className="comments">
				<h3>Comments</h3>
				{comment.length > 250 && (
					<p style={{ color: "red" }}>Comments should be less than 255 characters</p>
				)}
				{sessionUser && sessionUser.id !== owner.id && (
					<form onSubmit={handleCommentSubmit}>
						<textarea
							placeholder="Leave your comment here..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
						/>
						<button
							className="comment"
							type="submit"
							disabled={comment.length > 250 || comment.length < 1}>
							Add a Comment
						</button>
					</form>
				)}
				{comments.length < 1 && <h4>No comments on post.</h4>}
				{comments.reverse().map((comment) => (
					<div
						style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}
						key={comment.id}>
						<div className="content">
							<h5>{comment.User.username}</h5>
							<p>{comment.comment}</p>
						</div>
						{sessionUser && sessionUser.id === comment.User.id && deleteConfirm(comment.id)}
					</div>
				))}
			</span>
		</div>
	);
}

export default ImageModal;
