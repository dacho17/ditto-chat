import { useNavigate, useParams } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import { IoExpandOutline } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearChatState, clearChatThreadHistory } from "../../store/ChatSlice";
import IconButtonDropdown from "../iconButtonDropdown/IconButtonDropdown";
import IconButton from "../iconButton/IconButton";
import DropdownItem from "../../classes/DropdownItem";
import { ListType } from "../../enums/ListType";
import CONSTANTS from "../../../Constants";
import "./ChatFeatureList.css";

interface Props {
	listType: ListType
}

export default function ChatFeatureList(props: Props) {
	const { chatThread } = useAppSelector(state => state.chatSlice);
	const dispatch = useAppDispatch();
	const { chatThreadId } = useParams();
	const navigate = useNavigate();

	async function tryClearChatThreadHistory(): Promise<void> {
		try {
			await dispatch(clearChatThreadHistory({ chatThreadId: chatThreadId })).unwrap();
		} catch (err) {
			console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
		} finally {}					
	}

	const CHAT_FEATURE_LIST: DropdownItem[] = [
		new DropdownItem(
			"View Contact",
			() => {
				const chatterId = chatThread.getOverview().getChatterOverview().getId();
				dispatch(clearChatState());
				navigate(`${CONSTANTS.CHATTER_URL}/${chatterId}`);
			}
		),
		new DropdownItem(
			"Clear Chat",
			() => {
				tryClearChatThreadHistory();
			}
		)
	];

	function getListStyleClassName(listType: ListType): string {
		return listType === ListType.ROW ? "list-as-row" : "list-as-column";
	}

	const listStyleClassName = getListStyleClassName(props.listType);
	return <>
		<div className={`chat-feature-list ${listStyleClassName}`}>
			<IconButtonDropdown
				icon={<IoMdMore size={CONSTANTS.ICON_SIZE} />}
				dropdownItems={CHAT_FEATURE_LIST}
			/>
			<div className="expand-chatter-panel-button">
				<IconButton
					icon={<IoExpandOutline size={CONSTANTS.ICON_SIZE} />}
					onClick={() => console.log("TODO-call Reducer to Expand /chatter Panel")}
					// TODO: make this button change it icon based on whether panel is extended or not!
				/>
			</div>
		</div>
	</>
}
