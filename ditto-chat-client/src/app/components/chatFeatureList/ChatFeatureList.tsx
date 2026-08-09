import React from "react";
import { useNavigate } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import { IoExpandOutline, IoContractOutline } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearChatThreadHistory } from "../../store/ChatSlice";
import { setIsActiveChatThreadPanelExpanded } from "../../store/HomeSlice";
import useChatThreadIdParam from "../../hooks/UseChatParams";
import IconButtonDropdown from "../iconButtonDropdown/IconButtonDropdown";
import IconButton from "../iconButton/IconButton";
import DeviceScreenHelper from "../../helpers/DeviceScreenHelper";
import DropdownItem from "../../classes/DropdownItem";
import { ListType } from "../../enums/ListType";
import CONSTANTS from "../../../Constants";
import "./ChatFeatureList.css";

interface Props {
	listType: ListType
}

export default function ChatFeatureList(props: Props) {
	const { chatThread } = useAppSelector(state => state.chatSlice);
	const { isActiveChatThreadPanelExpanded } = useAppSelector(state => state.homeSlice);
	const dispatch = useAppDispatch();
	const chatThreadId = useChatThreadIdParam();
	const navigate = useNavigate();

	async function tryClearChatThreadHistory(): Promise<void> {
		try {
			await dispatch(clearChatThreadHistory({ chatThreadId: chatThreadId })).unwrap();
		} catch (err) {
			console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
		} finally {}
	}
	
	function getChatFeatureList(): DropdownItem[] {
		const CHAT_FEATURE_LIST: DropdownItem[] = [];
		if (DeviceScreenHelper.isPcScreen() === false) {
			CHAT_FEATURE_LIST.push(new DropdownItem(
				"View Contact",
				() => {
					const chatterId = chatThread.getOverview().getChatterOverview().getId();
					navigate(`${CONSTANTS.CHATTER_URL}/${chatterId}`);
				}
			));
		}

		CHAT_FEATURE_LIST.push(new DropdownItem(
			"Clear Chat",
			() => {
				tryClearChatThreadHistory();
			}
		));

		return CHAT_FEATURE_LIST;
	}

	function getListStyleClassName(listType: ListType): string {
		return listType === ListType.ROW ? "list-as-row" : "list-as-column";
	}

	function getPanelExpansionIcon(): React.JSX.Element {
		return isActiveChatThreadPanelExpanded === true
			? <IoContractOutline size={CONSTANTS.ICON_SIZE} />
			: <IoExpandOutline size={CONSTANTS.ICON_SIZE} />;
	}

	const listStyleClassName = getListStyleClassName(props.listType);
	return <>
		<div className={`chat-feature-list ${listStyleClassName}`}>
			<IconButtonDropdown
				icon={<IoMdMore size={CONSTANTS.ICON_SIZE} />}
				dropdownItems={getChatFeatureList()}
			/>
			<div className="expand-chatter-panel-button">
				<IconButton
					icon={getPanelExpansionIcon()}
					onClick={() => dispatch(setIsActiveChatThreadPanelExpanded(!isActiveChatThreadPanelExpanded))}
				/>
			</div>
		</div>
	</>
}
