import { confirmPromise, showError } from "comps/popup";
import { openPopupForm } from "comps/PopupForm";
import { GroupType } from "constant";
import { userService } from "lib/grpcClient";
import { handleGrpcError } from "lib/util/grpcUtil";
import { IdWrapper } from "proto/base_pb";
import {
  AddGroupReq,
  ChangeGroupReq,
  GroupDTO,
  ListGroupsReq,
  SwitchOrderReq,
} from "proto/user_pb";
import { useCallback, useEffect, useState } from "react";
import { BaseFieldSchema, getAuthMD } from "stores/GlobalStore";

interface Group {
  id: number;
  name: string;
}

export interface GroupsProps {
  groups?: Array<Group>;
  currentGroupIndex: number;
  addGroup: () => void;
  updateGroup: (index: number) => void;
  moveGroup: (direction: "up" | "down", index: number) => void;
  deleteGroup: (index: number) => void;
  changeGroup: (id: number) => void;
  setCurrentGroupIndex: React.Dispatch<React.SetStateAction<number>>;
}

const defaultGroupName: { [type in GroupType]: string } = {
  [GroupType.CoinAccount]: "我的资产",
  [GroupType.EosAccount]: "我的资产",
  [GroupType.StockAccount]: "我的股票",
  [GroupType.CoinTrade]: "交易记录",
  [GroupType.StockTrade]: "交易记录",
  [GroupType.FuturesTrade]: "交易记录",
  [GroupType.FuturesArbitrage]: "交易记录",
  [GroupType.GridTrade]: "网格交易工具",
};

export function useGroups(groupType: GroupType): GroupsProps {
  // 用来让 groups 自动更新
  const [groupVersion, setGroupVersion] = useState(0);
  // 分组选中的 index
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  const [groups, setGroups] = useState<Group[]>();

  const callAddGroup = useCallback(
    (name: string) => {
      const req = new AddGroupReq();
      req.setName(name);
      req.setGroupType(groupType);
      return userService.addGroup(req, getAuthMD());
    },
    [groupType]
  );

  // fetch groups
  useEffect(() => {
    const req = new ListGroupsReq();
    req.setType(groupType);
    userService
      .listGroups(req, getAuthMD())
      .then((res) => {
        if (res.getGroupsList().length === 0) {
          // 初始化 group
          return callAddGroup(defaultGroupName[groupType]).then(() =>
            setGroupVersion((i) => i + 1)
          );
        }
        setGroups(
          res.getGroupsList().map((g) => ({
            id: g.getId(),
            name: g.getName(),
          }))
        );
      })
      .catch(handleGrpcError)
      .catch(showError);
  }, [groupVersion, groupType, callAddGroup]);

  function addGroup() {
    if (!groups) {
      return;
    }
    const fields: Array<BaseFieldSchema> = [
      {
        type: "text",
        key: "title",
        title: "分组名",
      },
    ];
    openPopupForm({
      title: "添加分组",
      labelSpan: 3,
      fields,
      onSubmit: async (data: { [key: string]: any }) => {
        return callAddGroup(data.title)
          .then(() => {
            setGroupVersion((i) => i + 1);
          })
          .catch(handleGrpcError);
      },
    });
  }

  function updateGroup(index: number) {
    if (!groups) {
      return;
    }
    const fields: Array<BaseFieldSchema> = [
      {
        type: "text",
        key: "title",
        title: "分组名",
        defaultValue: groups[index].name,
      },
    ];
    openPopupForm({
      title: "修改分组",
      labelSpan: 3,
      fields,
      onSubmit: (data: { [key: string]: any }) => {
        if (!groups) {
          return;
        }
        const req = new GroupDTO();
        req.setId(groups[index].id);
        req.setName(data.title);
        return userService
          .updateGroup(req, getAuthMD())
          .then(() => {
            setGroupVersion((i) => i + 1);
          })
          .catch(handleGrpcError);
      },
    });
  }

  function deleteGroup(index: number) {
    if (!groups) {
      return;
    }

    const name = groups[index].name;
    confirmPromise("请确认", `确实要删除[${name}]吗？`).then((confirm) => {
      if (confirm) {
        const req = new IdWrapper();
        req.setId(groups[index].id);
        userService
          .deleteGroup(req, getAuthMD())
          .then(() => {
            if (index < currentGroupIndex) {
              setCurrentGroupIndex((i) => i - 1);
            }
            if (index === currentGroupIndex) {
              setCurrentGroupIndex(0);
            }
            setGroupVersion((i) => i + 1);
          })
          .catch(handleGrpcError)
          .catch(showError);
      }
    });
  }

  function moveGroup(direction: "up" | "down", index: number) {
    if (!groups) {
      return;
    }
    const otherIndex = direction === "up" ? index - 1 : index + 1;
    if (otherIndex < 0 || otherIndex >= groups.length) {
      return;
    }

    const req = new SwitchOrderReq();
    req.setIdA(groups[index].id);
    req.setIdB(groups[otherIndex].id);
    userService
      .switchGroup(req, getAuthMD())
      .then(() => {
        setGroupVersion((i) => i + 1);

        // 是否选中跟随移动
        if (otherIndex === currentGroupIndex) {
          setCurrentGroupIndex(index);
        } else if (index === currentGroupIndex) {
          setCurrentGroupIndex(otherIndex);
        }
      })
      .catch(handleGrpcError)
      .catch(showError);
  }

  function changeGroup(id: number) {
    if (!groups) {
      return;
    }
    openPopupForm({
      title: "更换分组",
      labelSpan: 3,
      fields: [
        {
          type: "select",
          selectOpts: groups
            .filter((group, i) => i !== currentGroupIndex)
            .map((group) => ({ value: group.id, text: group.name })),
          key: "groupId",
          title: "选择分组",
        },
      ],
      onSubmit: (data: { [key: string]: any }) => {
        if (!groups) {
          return;
        }
        const groupId = data.groupId;
        if (!groupId) {
          throw new Error("请选择新的分组");
        }

        const req = new ChangeGroupReq();
        req.setId(id);
        req.setToGroupId(groupId);
        userService
          .changeGroup(req, getAuthMD())
          // 调用 setGroups 让记录列表部分刷新
          .then(() => setGroups((groups) => groups && [...groups]))
          .catch(handleGrpcError);
      },
    });
  }

  return {
    groups,
    currentGroupIndex,
    addGroup,
    updateGroup,
    moveGroup,
    deleteGroup,
    changeGroup,
    setCurrentGroupIndex,
  };
}
