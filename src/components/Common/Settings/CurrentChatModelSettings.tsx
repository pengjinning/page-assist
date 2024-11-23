import { getPromptById } from "@/db"
import { useMessageOption } from "@/hooks/useMessageOption"
import { getAllModelSettings } from "@/services/model-settings"
import { useStoreChatModelSettings } from "@/store/model"
import { useQuery } from "@tanstack/react-query"
import {
  Collapse,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Skeleton
} from "antd"
import React from "react"
import { useTranslation } from "react-i18next"

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  useDrawer?: boolean
}

export const CurrentChatModelSettings = ({
  open,
  setOpen,
  useDrawer
}: Props) => {
  const { t } = useTranslation("common")
  const [form] = Form.useForm()
  const cUserSettings = useStoreChatModelSettings()
  const { selectedSystemPrompt } = useMessageOption()
  const { isPending: isLoading } = useQuery({
    queryKey: ["fetchModelConfig2", open],
    queryFn: async () => {
      const data = await getAllModelSettings()

      let tempSystemPrompt = "";

      // i hate this method but i need this feature so badly that i need to do this
      if (selectedSystemPrompt) {
        const prompt = await getPromptById(selectedSystemPrompt)
        tempSystemPrompt = prompt?.content ?? ""
      }

      form.setFieldsValue({
        temperature: cUserSettings.temperature ?? data.temperature,
        topK: cUserSettings.topK ?? data.topK,
        topP: cUserSettings.topP ?? data.topP,
        keepAlive: cUserSettings.keepAlive ?? data.keepAlive,
        numCtx: cUserSettings.numCtx ?? data.numCtx,
        seed: cUserSettings.seed,
        numGpu: cUserSettings.numGpu ?? data.numGpu,
        numPredict: cUserSettings.numPredict ?? data.numPredict,
        systemPrompt: cUserSettings.systemPrompt ?? tempSystemPrompt
      })
      return data
    },
    enabled: open,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })


  const renderBody = () => {
    return (
      <>
        {!isLoading ? (
          <Form
            onFinish={(values: {
              keepAlive: string
              temperature: number
              topK: number
              topP: number
            }) => {
              Object.entries(values).forEach(([key, value]) => {
                cUserSettings.setX(key, value)
                setOpen(false)
              })
            }}
            form={form}
            layout="vertical">
            {useDrawer && (
              <>
                <Form.Item
                  name="systemPrompt"
                  help={t("modelSettings.form.systemPrompt.help")}
                  label={t("modelSettings.form.systemPrompt.label")}>
                  <Input.TextArea
                    rows={4}
                    placeholder={t(
                      "modelSettings.form.systemPrompt.placeholder"
                    )}
                  />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="keepAlive"
              help={t("modelSettings.form.keepAlive.help")}
              label={t("modelSettings.form.keepAlive.label")}>
              <Input
                placeholder={t("modelSettings.form.keepAlive.placeholder")}
              />
            </Form.Item>

            <Form.Item
              name="temperature"
              label={t("modelSettings.form.temperature.label")}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder={t("modelSettings.form.temperature.placeholder")}
              />
            </Form.Item>
            <Form.Item
              name="seed"
              help={t("modelSettings.form.seed.help")}
              label={t("modelSettings.form.seed.label")}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder={t("modelSettings.form.seed.placeholder")}
              />
            </Form.Item>
            <Form.Item
              name="numCtx"
              label={t("modelSettings.form.numCtx.label")}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder={t("modelSettings.form.numCtx.placeholder")}
              />
            </Form.Item>

            <Form.Item
              name="numPredict"
              label={t("modelSettings.form.numPredict.label")}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder={t("modelSettings.form.numPredict.placeholder")}
              />
            </Form.Item>

            <Collapse
              ghost
              className="border-none bg-transparent"
              items={[
                {
                  key: "1",
                  label: t("modelSettings.advanced"),
                  children: (
                    <React.Fragment>
                      <Form.Item
                        name="topK"
                        label={t("modelSettings.form.topK.label")}>
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("modelSettings.form.topK.placeholder")}
                        />
                      </Form.Item>

                      <Form.Item
                        name="topP"
                        label={t("modelSettings.form.topP.label")}>
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("modelSettings.form.topP.placeholder")}
                        />
                      </Form.Item>

                      <Form.Item
                        name="numGpu"
                        label={t("modelSettings.form.numGpu.label")}>
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t(
                            "modelSettings.form.numGpu.placeholder"
                          )}
                        />
                      </Form.Item>
                    </React.Fragment>
                  )
                }
              ]}
            />

            <button
              type="submit"
              className="inline-flex justify-center w-full text-center mt-3 items-center rounded-md border border-transparent bg-black px-2 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100 dark:focus:ring-gray-500 dark:focus:ring-offset-gray-100 disabled:opacity-50 ">
              {t("save")}
            </button>
          </Form>
        ) : (
          <Skeleton active />
        )}
      </>
    )
  }

  if (useDrawer) {
    return (
      <Drawer
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
        width={500}
        title={t("currentChatModelSettings")}>
        {renderBody()}
      </Drawer>
    )
  }

  return (
    <Modal
      title={t("currentChatModelSettings")}
      open={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      footer={null}>
      {renderBody()}
    </Modal>
  )
}
