import React, { useEffect, useState } from 'react'

import darkVars from 'assets/styles/themes/dark.json';
import lightVars from 'assets/styles/themes/light.json';
import { Button, message } from 'antd';
import { MdOutlineLightMode, MdDarkMode } from "react-icons/md";
import { getThemeActions, selectTheme } from 'core/services/kgm/PresentationService';
import { RootState } from 'core/store';
import { connect } from 'react-redux';


const mapDispatchToProps = {
  setTheme: getThemeActions.request
};

const mapStateToProps = (state: RootState) => {
  return {
    currentTheme: selectTheme(state)
  }
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;


function ThemeProvider({ currentTheme, setTheme }: Props) {
  const initialValue = lightVars;
  const [vars, setVars] = useState({});

  // const updateVar = (varName, newVal) => {
  //   setVars({ ...vars, [varName]: newVal });
  //   setThemeVars();
  // }

  const setThemeVars = () => {
    (window as any).less.modifyVars(vars)
      .then(() => {
      }).catch(error => {
        console.log(`Failed to update theme`);
      });
    localStorage.setItem("app-theme", JSON.stringify(vars));
  }

  useEffect(() => {
    const theme = localStorage.getItem("app-theme");
    if (!theme) {
      setVars(initialValue);
    }
    else {
      setVars(Object.assign({}, JSON.parse(theme as any)));
    }
    setThemeVars();
  }, [currentTheme]);

  const changeTheme = () => {
    const newVars = currentTheme === "light" ? darkVars : lightVars;
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setVars({ ...newVars });
    setTheme({ theme: newTheme });
  }
  return (
    <Button
      type="primary"
      onClick={() => changeTheme()}
      icon={currentTheme === "light" ? <MdOutlineLightMode /> : <MdDarkMode />}
      style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}
    />
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ThemeProvider);
