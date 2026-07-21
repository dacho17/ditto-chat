import { useNavigate } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import { IoExpandOutline } from "react-icons/io5";
import IconButtonDropdown from "../iconButtonDropdown/IconButtonDropdown";
import IconButton from "../iconButton/IconButton";
import DropdownItem from "../../interfaces/DropdownItem";
import { ListType } from "../../enums/ListType";
import CONSTANTS from "../../../Constants";
import "./ChatFeatureList.css";

interface Props {
	listType: ListType
}

const ICON_SIZE = 24;

export default function ChatFeatureList(props: Props) {
	const navigate = useNavigate();

	const CHAT_FEATURE_LIST: DropdownItem[] = [
		{
			itemName: "View Contact",
    		onClickFunction: () => navigate(`${CONSTANTS.CHATTER_URL}/TODO`)
		},
		{
			itemName: "Clear Chat",
			onClickFunction: () => console.log("Call AsyncThunk Function to Send HTTP Request to Clear Chat")
		}
	];

	function getListStyleClassName(listType: ListType): string {
		return listType === ListType.ROW ? "list-as-row" : "list-as-column";
	}

	const listStyleClassName = getListStyleClassName(props.listType);
	return <>
		<div className={`chat-feature-list ${listStyleClassName}`}>
			<IconButtonDropdown
				icon={<IoMdMore size={ICON_SIZE} />}
				dropdownItems={CHAT_FEATURE_LIST}
			/>
			<div className="expand-chatter-panel-button">
				<IconButton
					icon={<IoExpandOutline size={ICON_SIZE} />}
					onClick={() => console.log("TODO-call Reducer to Expand /chatter Panel")}
					// TODO: make this button change it icon based on whether panel is extended or not!
				/>
			</div>
		</div>
	</>
}
