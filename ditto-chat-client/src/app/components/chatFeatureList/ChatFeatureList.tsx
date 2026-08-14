import React from "react";
import { useNavigate } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import { IoExpandOutline, IoContractOutline } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { clearChatThreadHistory } from "../../store/ChatSlice";
import { setIsActiveChatThreadPanelExpanded } from "../../store/HomeSlice";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import IconButtonDropdown from "../iconButtonDropdown/IconButtonDropdown";
import IconButton from "../iconButton/IconButton";
import ChatThread from "../../classes/ChatThread";
import DropdownItem from "../../classes/DropdownItem";
import { ListType } from "../../enums/ListType";
import { DeviceType } from "../../enums/DeviceType";
import CONSTANTS from "../../../Constants";
import "./ChatFeatureList.css";

interface Props {
	activeChatThread: ChatThread;
	listType: ListType
}

export default function ChatFeatureList(props: Props) {
	const { isActiveChatThreadPanelExpanded } = useAppSelector(state => state.homeSlice);
    const { currentDeviceType } = useAppSelector(state => state.deviceTypeSlice);
	const dispatch = useAppDispatch();
	const [sendTryToClearChatThreadHistory, _] = useTryToSendRequest<null>();
	const navigate = useNavigate();

	async function tryToClearChatThreadHistory(): Promise<void> {
		await sendTryToClearChatThreadHistory(async () => {
			await dispatch(clearChatThreadHistory({ chatThreadId: props.activeChatThread.getOverview().getId() })).unwrap();
			return null;
		}, () => {});
	}
	
	function getChatFeatureList(): DropdownItem[] {
		const CHAT_FEATURE_LIST: DropdownItem[] = [];
		if (currentDeviceType !== DeviceType.PC) {
			CHAT_FEATURE_LIST.push(new DropdownItem(
				"View Contact",
				() => {
					const chatterId = props.activeChatThread.getOverview().getChatterOverview().getId();
					navigate(`${CONSTANTS.CHATTER_URL}/${chatterId}`);
				}
			));
		}

		CHAT_FEATURE_LIST.push(new DropdownItem(
			"Clear Chat",
			() => {
				tryToClearChatThreadHistory();
			}
		));

		return CHAT_FEATURE_LIST;
	}

	function getPanelExpansionIcon(): React.JSX.Element {
		return isActiveChatThreadPanelExpanded === true
			? <IoContractOutline size={CONSTANTS.ICON_SIZE} />
			: <IoExpandOutline size={CONSTANTS.ICON_SIZE} />;
	}

	const listStyleClassName = props.listType === ListType.ROW ? "list-as-row" : "list-as-column";;
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
