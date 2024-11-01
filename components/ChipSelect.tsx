import { Theme, useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
// import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import { Avatar } from "@mui/material";
import { Participant } from "@/app/page";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  "Oliver Hansen",
  "Van Henry",
  "April Tucker",
  "Ralph Hubbard",
  "Omar Alexander",
  "Carlos Abbott",
  "Miriam Wagner",
  "Bradley Wilkerson",
  "Virginia Andrews",
  "Kelly Snyder",
];

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

// interface Option {
//   label: string;
//   value: string;
//   paid: number;
// }

interface ChipSelectProps {
  availableOptions: Participant[];
  selectedOptions: Participant[]; // The selected options passed from the parent
  onSelectionChange: (selectedOptions: Participant[]) => void; // Callback to notify the parent
}

export default function ChipSelect({
  availableOptions,
  selectedOptions: parentSelectedOptions,
  onSelectionChange,
}: ChipSelectProps) {
  const theme = useTheme();
  const [selectedOptions, setSelectedOptions] = useState<Participant[]>(
    parentSelectedOptions
  );

  // Sync local state with parent prop
  useEffect(() => {
    setSelectedOptions(parentSelectedOptions);
  }, [parentSelectedOptions]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

    const newSelectedOptions =
      typeof value === "string" ? value.split(",") : value;

    // Find selected Participant objects based on value
    const updatedOptions = availableOptions.filter((option) =>
      newSelectedOptions.includes(option.value)
    );

    setSelectedOptions(updatedOptions);
    onSelectionChange(updatedOptions); // Notify the parent about the change
  };

  return (
    <FormControl sx={{}} className="w-full">
      <Select
        labelId="demo-multiple-chip-label"
        id="demo-multiple-chip"
        multiple
        value={selectedOptions.map((option) => option.value)}
        onChange={handleChange}
        input={
          <OutlinedInput
            id="select-multiple-chip"
            sx={{ borderRadius: "50px" }}
          />
        }
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value: string) => {
              const participant = availableOptions.find(
                (option) => option.value === value
              );
              return (
                <Chip
                  key={value}
                  label={value}
                  avatar={<Avatar alt="Natacha" src={participant?.avatar} />}
                />
              );
            })}
          </Box>
        )}
        MenuProps={MenuProps}
        sx={{
          borderRadius: "50px", // Rounded edges for the select dropdown
          ".MuiSelect-select": {
            borderRadius: "50px", // Ensure the selected value has rounded edges
            paddingTop: "8px",
            paddingBottom: "8px",
          },
        }}
      >
        {availableOptions.map((item) => (
          <MenuItem
            key={item.label}
            value={item.value}
            // style={getStyles(item.label, selectedOptions, theme)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
