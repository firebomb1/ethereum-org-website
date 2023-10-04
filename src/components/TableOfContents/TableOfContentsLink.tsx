import React from "react"
import { SystemStyleObject, cssVar } from "@chakra-ui/react"
import { BaseLink } from "../Link"
import { getCustomId, trimmedTitle } from "@/lib/utils/toc"
import type { ToCItem } from "@/lib/interfaces"

export interface IPropsTableOfContentsLink {
  depth: number
  item: ToCItem
  activeHash?: string
}

const Link: React.FC<IPropsTableOfContentsLink> = ({
  depth,
  item,
  activeHash,
}) => {
  const url = `#${getCustomId(item.title)}`

  const isActive = activeHash === url
  const isNested = depth === 2

  let classes = ""
  if (isActive) {
    classes += " active"
  }
  if (isNested) {
    classes += " nested"
  }

  const $dotBg = cssVar("dot-bg")

  const hoverOrActiveStyle: SystemStyleObject = {
    color: "primary.base",
    _after: {
      content: `""`,
      background: $dotBg.reference,
      border: "1px",
      borderColor: "primary.base",
      borderRadius: "50%",
      boxSize: 2,
      position: "absolute",
      left: "-1.29rem",
      top: "50%",
      mt: -1,
    },
  }

  return (
    <BaseLink
      href={url}
      className={classes}
      textDecoration="none"
      display="inline-block"
      position="relative"
      color="textTableOfContents"
      fontWeight="normal"
      mb="0.5rem !important"
      width={{ base: "100%", lg: "auto" }}
      _hover={{
        ...hoverOrActiveStyle,
      }}
      sx={{
        [$dotBg.variable]: "colors.background",
        "&.active": {
          [$dotBg.variable]: "colors.primary",
          ...hoverOrActiveStyle,
        },
        "&.nested": {
          _before: {
            content: `"⌞"`,
            opacity: 0.5,
            display: "inline-flex",
            position: "absolute",
            left: -3.5,
            top: -1,
          },
          "&.active, &:hover": {
            _after: {
              left: "-2.29rem",
            },
          },
        },
      }}
    >
      {trimmedTitle(item.title)}
    </BaseLink>
  )
}

export default Link
